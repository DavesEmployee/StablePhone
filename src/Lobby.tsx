import React, { useState, useEffect, useRef } from "react";
import Avatar from "boring-avatars";

import PlayerList from "./PlayerList";


const WS_URL = "ws://localhost:8000/ws";

type Player = {
    name: string;
    ready: boolean;
};

const Lobby: React.FC = () => {
    const [name, setName] = useState("");
    const [players, setPlayers] = useState<Player[]>([]);
    const [joined, setJoined] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const [gamePhase, setGamePhase] = useState("lobby");
    const [roundNumber, setRoundNumber] = useState(1);
    const [prompt, setPrompt] = useState("");
    const [assignedChain, setAssignedChain] = useState<string | null>(null);
    const [prevPrompt, setPrevPrompt] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [currentImage, setCurrentImage] = useState<string | null>(null); // In future, this could be base64 image
    const [latestAssignments, setLatestAssignments] = useState<{ [k: string]: string } | null>(null);
    const [latestChains, setLatestChains] = useState<any>(null);
    const [wantsRestart, setWantsRestart] = useState(false);
    const prevPhase = useRef<string>("lobby");
    const [finalScores, setFinalScores] = useState<{ [name: string]: number }>({});
    const [expandedImage, setExpandedImage] = useState<string | null>(null);
    const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);


    useEffect(() => {
        ws.current = new WebSocket(WS_URL);

        ws.current.onopen = () => {
            console.log("Connected to backend WebSocket!");
        };

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "game_state") {
                setPlayers(message.players);
                setGamePhase(message.phase);
                setRoundNumber(message.round_number);

                // Store assignments/chains for use in the next effect
                setLatestAssignments(message.assignments ?? null);
                setLatestChains(message.chains ?? null);

                setFinalScores(message.scores || {});
            }
        };

        ws.current.onclose = () => {
            console.log("WebSocket connection closed");
        };

        return () => {
            ws.current?.close();
        };
    }, []);

    useEffect(() => {
        // If the phase transitions back to lobby, reset everything
        if (gamePhase === "lobby" && prevPhase.current !== "lobby") {
            setName("");
            setPlayers([]);
            setJoined(false);
            setPrompt("");
            setAssignedChain(null);
            setPrevPrompt(null);
            setDescription("");
            setCurrentImage(null);
            setGamePhase("lobby");
            setRoundNumber(1);
            setLatestAssignments(null);
            setLatestChains(null);
            setWantsRestart(false);
        }
        prevPhase.current = gamePhase;
    }, [gamePhase]);


    useEffect(() => {
        if (latestAssignments && name && latestAssignments[name]) {
            setAssignedChain(latestAssignments[name]);
            const chain = latestChains?.[latestAssignments[name]];
            let imageToShow: string | null = null;
            if (chain && chain.length > 0) {
                for (let i = chain.length - 1; i >= 0; i--) {
                    if (chain[i].player !== name) {
                        imageToShow = chain[i].image;
                        break;
                    }
                }
            }
            setCurrentImage(imageToShow);
        } else {
            setAssignedChain(null);
            setCurrentImage(null);
        }
    }, [name, latestAssignments, latestChains]);



    const handleJoin = () => {
        if (!name.trim()) return;
        if (joined) return;
        ws.current?.send(JSON.stringify({ type: "join", name }));
        setJoined(true);
    };

    const handleReady = () => {
        ws.current?.send(JSON.stringify({ type: "ready", name }));
    };

    useEffect(() => {
        setDescription("");
    }, [roundNumber, assignedChain]);


    if (gamePhase === "game" && roundNumber === 1) {
        return (
            <div>
            <h2>Round 1: Start your chain!</h2>
            <input
                type="text"
                placeholder="Write your prompt"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                disabled={joined && !!players.find(p => p.name === name && p.ready)}
            />
            <button
                onClick={() => {
                ws.current?.send(
                    JSON.stringify({ type: "submit_prompt", name, prompt })
                );
                }}
                disabled={joined && !!players.find(p => p.name === name && p.ready)}
            >
                Submit
            </button>
            </div>
        );
    }

    if (gamePhase === "game" && roundNumber > 1 && assignedChain && currentImage) {
        const isReady = !!players.find(p => p.name === name && p.ready);
        return (
            <div>
                <h2>Round {roundNumber}: Describe the image!</h2>
                <div>
                    <strong>You are working on {assignedChain}'s chain.</strong>
                </div>
                <div style={{ border: "1px solid #ddd", padding: "1em", margin: "1em 0" }}>
                    <strong>Image to describe:</strong>
                    <div>
                        <img
                            src={`data:image/png;base64,${currentImage}`}
                            alt="AI generated"
                            style={{ maxWidth: 256, maxHeight: 256, border: "1px solid #888", marginTop: 8 }}
                        />
                    </div>
                </div>
                <input
                    type="text"
                    placeholder="Your description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    disabled={isReady}
                />
                <button
                    onClick={() => {
                        ws.current?.send(JSON.stringify({
                            type: "submit_description",
                            name,
                            description,
                            chain_owner: assignedChain,
                        }));
                    }}
                    disabled={isReady}
                >
                    Submit
                </button>
            </div>
        );
    }


    if (gamePhase === "gallery") {
        return (
            <div>
                <h2>Game Over! Check Out Your Masterpieces!</h2>
                {latestChains &&
                    Object.entries(latestChains).map(([owner, steps]) => (
                        <div
                            key={owner}
                            style={{
                                margin: "2em 0",
                                padding: "1em",
                                border: "1px solid #ccc",
                                borderRadius: 8,
                                background: "#fafaff",
                                boxShadow: "0 1px 6px #eee"
                            }}
                        >
                            <h3 style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "#265"}}>
                                <Avatar
                                    size={32}
                                    name={owner}
                                    variant="beam"
                                    square={false}
                                    colors={["#6C9", "#FFD166", "#EF476F", "#06D6A0", "#118AB2", "#8338EC", "#FFBE0B"]}
                                />
                                <span style={{fontWeight: 600}}>{owner}'s Gallery</span>
                            </h3>
                            <div
                                style={{
                                    display: "flex",
                                    overflowX: "auto",
                                    gap: 24,
                                    padding: "8px 0"
                                }}
                            >
                                {(steps as any[]).map((step, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            minWidth: 160,
                                            maxWidth: 220,
                                            flex: "0 0 auto",
                                            textAlign: "center",
                                            cursor: step.image ? "pointer" : "default",
                                            background: "#fff",
                                            border: "1px solid #e2e2e2",
                                            borderRadius: 8,
                                            boxShadow: "0 1px 4px #eee",
                                            padding: 10,
                                            transition: "box-shadow 0.2s",
                                        }}
                                        onClick={() => {
                                            if (step.image) {
                                                setExpandedImage(step.image);
                                                setExpandedPrompt(`"${step.prompt}" by ${step.player}`);
                                            }
                                        }}

                                    >
                                        {step.image && (
                                            <img
                                                src={`data:image/png;base64,${step.image}`}
                                                alt={step.prompt}
                                                style={{
                                                    maxWidth: 128,
                                                    maxHeight: 128,
                                                    marginBottom: 8,
                                                    borderRadius: 6,
                                                    border: "1px solid #aaa"
                                                }}
                                            />
                                        )}
                                        <div style={{
                                            marginTop: 6,
                                            fontSize: "0.95em",
                                            color: "#223",
                                            fontWeight: 500,
                                            background: "#f7f7fa",
                                            borderRadius: 4,
                                            padding: "2px 4px",
                                            minHeight: 28
                                        }}>
                                            <span style={{fontWeight: 700, color: "#384"}}>{step.player}</span>
                                            <span style={{marginLeft: 4, color: "#444"}}>“{step.prompt}”</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                }

                {expandedImage && (
                    <div
                        style={{
                            position: "fixed",
                            left: 0,
                            top: 0,
                            width: "100vw",
                            height: "100vh",
                            background: "rgba(0,0,0,0.66)",
                            zIndex: 1000,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                        onClick={() => setExpandedImage(null)}
                    >
                        <div
                            style={{
                                background: "#fff",
                                padding: 20,
                                borderRadius: 12,
                                boxShadow: "0 2px 20px #3338",
                                maxWidth: "90vw",
                                maxHeight: "90vh",
                                textAlign: "center",
                                position: "relative"
                            }}
                        >
                            <img
                                src={`data:image/png;base64,${expandedImage}`}
                                alt="Expanded"
                                style={{maxWidth: "80vw", maxHeight: "70vh", borderRadius: 8, border: "1px solid #aaa"}}
                            />
                            <div style={{marginTop: 12, fontWeight: 500, color: "#245"}}>{expandedPrompt}</div>
                            <button
                                style={{
                                    position: "absolute",
                                    top: 10,
                                    right: 10,
                                    background: "#eee",
                                    border: "none",
                                    borderRadius: 6,
                                    fontWeight: 600,
                                    padding: "4px 12px",
                                    fontSize: "1.1em",
                                    cursor: "pointer"
                                }}
                                onClick={() => setExpandedImage(null)}
                            >Close</button>
                        </div>
                    </div>
                )}



                {finalScores && Object.keys(finalScores).length > 0 && (
                    <div style={{marginTop: 24}}>
                        <h2>Scoreboard</h2>
                        <table style={{borderCollapse: "collapse", width: "100%"}}>
                            <thead>
                                <tr>
                                    <th style={{textAlign: "left", borderBottom: "1px solid #ccc"}}>Player</th>
                                    <th style={{textAlign: "right", borderBottom: "1px solid #ccc"}}>Score (0–1000)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(finalScores)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([player, score]) => (
                                        <tr key={player}>
                                            <td style={{display: "flex", alignItems: "center", gap: 10}}>
                                                <Avatar
                                                    size={24}
                                                    name={player}
                                                    variant="beam"
                                                    square={false}
                                                    colors={["#6C9", "#FFD166", "#EF476F", "#06D6A0", "#118AB2", "#8338EC", "#FFBE0B"]}
                                                />
                                                <span style={{fontWeight: 600}}>{player}</span>
                                            </td>
                                            <td style={{textAlign: "right"}}>{score}</td>
                                        </tr>
                                    ))}

                            </tbody>
                        </table>
                    </div>
                )}


                {!wantsRestart ? (
                    <button style={{marginTop: 24}} onClick={() => setWantsRestart(true)}>
                        Restart Game
                    </button>
                ) : (
                    <div>
                        <p>Are you sure you want to restart? This will reset the lobby and all players will need to join again.</p>
                        <button style={{marginRight: 10}} onClick={() => {
                            ws.current?.send(JSON.stringify({ type: "restart_game" }));
                            setWantsRestart(false);
                        }}>
                            Confirm Restart
                        </button>
                        <button onClick={() => setWantsRestart(false)}>Cancel</button>
                    </div>
                )}
            </div>
        );
    }

    if (!name) {
        return (
            <div>
                <h2>Rejoin or Join Game</h2>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <button onClick={() => {
                    ws.current?.send(JSON.stringify({ type: "join", name }));
                    setJoined(true);
                }}>
                    Join / Rejoin
                </button>
                <p>
                    If you disconnected or refreshed, just re-enter your old name to continue playing!
                </p>
            </div>
        );
    }



    return (
        <div>
            <h2>Lobby</h2>
            {!joined && (
                <div>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <button onClick={handleJoin}>Join</button>
                </div>
            )}
            {joined && (
                <div>
                    <span>Welcome, {name}!</span>
                    <button onClick={handleReady}>Ready</button>
                </div>
            )}
            <h3>Players</h3>
            <PlayerList players={players} currentName={name} />
        </div>
    );
};

export default Lobby;
