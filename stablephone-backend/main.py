from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import json
import random

import websocket #NOTE: websocket-client (https://github.com/websocket-client/websocket-client)
import uuid
import urllib.request
import urllib.parse
import io
import time
import base64

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# load workflow from file
with open("SDXL Turbo API.json", "r", encoding="utf-8") as f:
    workflow_data = f.read()

t2i_workflow = json.loads(workflow_data)

# #set the seed for our KSampler node
t2i_workflow["13"]["inputs"]["noise_seed"] = random.randint(0,100000)

model = SentenceTransformer("all-mpnet-base-v2")

server_address = "127.0.0.1:8188"
client_id = str(uuid.uuid4())

def queue_prompt(prompt):
    p = {"prompt": prompt, "client_id": client_id}
    data = json.dumps(p).encode('utf-8')
    req =  urllib.request.Request("http://{}/prompt".format(server_address), data=data)
    return json.loads(urllib.request.urlopen(req).read())

def get_images(ws, prompt):
    prompt_id = queue_prompt(prompt)['prompt_id']
    output_images = {}
    current_node = ""
    while True:
        out = ws.recv()
        if isinstance(out, str):
            message = json.loads(out)
            if message['type'] == 'executing':
                data = message['data']
                if data['prompt_id'] == prompt_id:
                    if data['node'] is None:
                        break #Execution is done
                    else:
                        current_node = data['node']
        else:
            if current_node == 'save_image_websocket_node':
                images_output = output_images.get(current_node, [])
                images_output.append(out[8:])
                output_images[current_node] = images_output

    return output_images

def generate_image(prompt, workflow=t2i_workflow):
    max_retries = 5
    for attempt in range(1, max_retries + 1):
        try:
            workflow["6"]["inputs"]["text"] = prompt
            workflow["13"]["inputs"]["noise_seed"] = random.randint(0,100000)
            ws = websocket.WebSocket()
            ws.connect("ws://{}/ws?clientId={}".format(server_address, client_id))
            images = get_images(ws, workflow)

            ws.close()

            for node_id in images:
                for image_data in images[node_id]:
                    image = base64.b64encode(image_data).decode("utf-8")
                    return image
        except Exception as e:
            print(f"Attempt {attempt}: Failed with error: {e}")
            if attempt < max_retries:
                print(f"Retrying in 1 seconds...")
                time.sleep(1)
            else:
                print("All attempts failed.")
                raise  # Re-raise the exception after final failure
        finally:
            try:
                ws.close()
            except Exception:
                pass  # Ensure WebSocket is closed even on failure

def compute_scores(chains):
    player_scores = {}  # {player: [score, score, ...]}
    for chain in chains.values():
        for i in range(1, len(chain)):
            prev_prompt = chain[i-1]["prompt"]
            curr = chain[i]
            curr_prompt = curr["prompt"]
            player = curr["player"]

            emb = model.encode([prev_prompt, curr_prompt])
            sim = float(cosine_similarity([emb[0]], [emb[1]])[0][0])

            if player not in player_scores:
                player_scores[player] = []
            player_scores[player].append(sim)

    # Compute average, rounded and scaled
    final_scores = {
        player: int(round((sum(scores) / len(scores)), 3) * 1000) if scores else 0
        for player, scores in player_scores.items()
    }
    return final_scores


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

# This holds the global lobby state
players: Dict[str, Dict] = {}
game_phase = "lobby"  # could be 'lobby', 'game', or 'gallery'
round_number = 1
chains = {}  # {player_name: [ { "player": ..., "prompt": ..., "image": ... } ]}
chain_assignments = {}  # {player_name: assigned_chain_owner}
player_chain_history = {}  # {player_name: set(chain_owners they've already worked on)}



def assign_chains(players, player_chain_history):
    player_names = list(players.keys())
    for _ in range(100):  # Try up to 100 times to find a valid assignment
        available = player_names.copy()
        random.shuffle(available)
        assignment = {}
        used = set()
        for player in player_names:
            options = [
                c for c in available
                if c != player and c not in player_chain_history[player] and c not in used
            ]
            if not options:
                break
            chosen = random.choice(options)
            assignment[player] = chosen
            used.add(chosen)
        if len(assignment) == len(player_names):
            return assignment
    raise Exception("No valid assignment found")


def get_lobby_state():
    # Return a serializable representation
    return [{"name": name, "ready": p["ready"]} for name, p in players.items()]

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global round_number, chain_assignments, game_phase 
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "join":
                name = data["name"]
                if name not in players:
                    players[name] = {"ready": False}
            elif msg_type == "ready":
                name = data["name"]
                if name in players:
                    players[name]["ready"] = True
            elif msg_type == "submit_prompt":
                # global round_number, chain_assignments
                name = data["name"]
                prompt = data["prompt"]
                if round_number == 1 and name not in chains:
                    image_b64 = generate_image(prompt)
                    chains[name] = [{
                        "player": name,
                        "prompt": prompt,
                        "image": image_b64
                    }]
                    players[name]["ready"] = True


                # Check if all players have submitted their prompt
                if len(chains) == len(players):
                    round_number += 1
                    # Defensive: ensure chain history exists
                    for pname in players:
                        if pname not in player_chain_history:
                            player_chain_history[pname] = set()
                    # Mark that everyone has worked on their own chain
                    for pname in players:
                        player_chain_history[pname].add(pname)
                        players[pname]["ready"] = False  # Reset ready for round 2

                    # Assign chains for round 2
                    chain_assignments = assign_chains(players, player_chain_history)
                    print("Assignments for round 2:", chain_assignments)

            elif msg_type == "submit_description":
                # global round_number, chain_assignments, game_phase  # <-- must be first in this block!
                name = data["name"]
                description = data["description"]
                chain_owner = data["chain_owner"]

                # Now safely use round_number, etc.
                if chain_owner in chains:
                    image_b64 = generate_image(description)
                    chains[chain_owner].append({
                        "player": name,
                        "prompt": description,
                        "image": image_b64
                    })
                    players[name]["ready"] = True

                if name in player_chain_history:
                    player_chain_history[name].add(chain_owner)

                all_ready = all(p["ready"] for p in players.values())
                max_rounds = len(players)

                if all_ready:
                    round_number += 1
                    for pname in players:
                        players[pname]["ready"] = False

                    if round_number <= max_rounds:
                        chain_assignments = assign_chains(players, player_chain_history)
                    else:
                        game_phase = "gallery"
                        final_scores = compute_scores(chains)
                        print("Final scores:", final_scores)

                await manager.broadcast({
                    "type": "game_state",
                    "phase": game_phase,
                    "round_number": round_number,
                    "players": get_lobby_state(),
                    "chains": chains,
                    "assignments": chain_assignments,
                    "scores": final_scores if game_phase == "gallery" else {},
                })

            elif msg_type == "restart_game":
                # Reset all game state variables
                players.clear()
                game_phase = "lobby"
                round_number = 1
                chains.clear()
                chain_assignments.clear()
                player_chain_history.clear()
                # Broadcast fresh lobby state
                await manager.broadcast({
                    "type": "game_state",
                    "phase": game_phase,
                    "round_number": round_number,
                    "players": get_lobby_state(),
                    "chains": chains,
                    "assignments": chain_assignments,
                    "scores": final_scores if game_phase == "gallery" else {},
                })

            # PHASE TRANSITION LOGIC
            # global game_phase
            if game_phase == "lobby":
                if players and all(p["ready"] for p in players.values()):
                    game_phase = "game"
                    for pname in players:
                        players[pname]["ready"] = False
                        # Reset all players for the next phase if needed
                        player_chain_history[pname] = set()

            # Broadcast new state to everyone after any change
            await manager.broadcast({
                "type": "game_state",
                "phase": game_phase,
                "round_number": round_number,
                "players": get_lobby_state(),
                "chains": chains,
                "assignments": chain_assignments,
                "scores": final_scores if game_phase == "gallery" else {},
            })

    except WebSocketDisconnect:
        manager.disconnect(websocket)
