import React, { useState, useEffect, useRef } from "react";
import LobbyPhase from "./LobbyPhase";
import GameRound from "./GameRound";
import Gallery from "./Gallery";

const WS_URL = "ws://localhost:8000/ws";

type Player = { name: string; ready: boolean };

const GameController: React.FC = () => {
    // Main state
    const [name, setName] = useState("");
    const [players, setPlayers] = useState<Player[]>([]);
    const [joined, setJoined] = useState(false);
    const [gamePhase, setGamePhase] = useState("lobby");
    const [roundNumber, setRoundNumber] = useState(1);
    const [prompt, setPrompt] = useState("");
    const [description, setDescription] = useState("");
    const [assignedChain, setAssignedChain] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [latestChains, setLatestChains] = useState<any>(null);
    const [finalScores, setFinalScores] = useState<{ [name: string]: number }>({});
    const [latestAssignments, setLatestAssignments] = useState<{ [k: string]: string } | null>(null);

    // Gallery and restart modal state
    const [wantsRestart, setWantsRestart] = useState(false);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);
    const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

    const ws = useRef<WebSocket | null>(null);

    // Connect to WebSocket, update state on message
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

    // Update assignedChain and currentImage when assignment or chains change
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

    // Reset description on new round/assignment
    useEffect(() => {
        setDescription("");
    }, [roundNumber, assignedChain]);

    // Reset all local state on restart/lobby transition
    const prevPhase = useRef<string>("lobby");
    useEffect(() => {
        if (gamePhase === "lobby" && prevPhase.current !== "lobby") {
            setName("");
            setPlayers([]);
            setJoined(false);
            setPrompt("");
            setAssignedChain(null);
            setDescription("");
            setCurrentImage(null);
            setLatestAssignments(null);
            setLatestChains(null);
            setWantsRestart(false);
            setExpandedImage(null);
            setExpandedPrompt(null);
            setFinalScores({});
            setRoundNumber(1);
        }
        prevPhase.current = gamePhase;
    }, [gamePhase]);

    // Handlers
    const handleJoin = () => {
        if (!name.trim()) return;
        if (joined) return;
        ws.current?.send(JSON.stringify({ type: "join", name }));
        setJoined(true);
    };

    const handleReady = () => {
        ws.current?.send(JSON.stringify({ type: "ready", name }));
    };

    // Phase router
    if (gamePhase === "lobby") {
        return (
            <LobbyPhase
                name={name}
                setName={setName}
                joined={joined}
                setJoined={setJoined}
                handleJoin={handleJoin}
                handleReady={handleReady}
                players={players}
            />
        );
    }

    if (gamePhase === "game") {
        return (
            <GameRound
                name={name}
                players={players}
                roundNumber={roundNumber}
                gamePhase={gamePhase}
                assignedChain={assignedChain}
                currentImage={currentImage}
                prompt={prompt}
                setPrompt={setPrompt}
                description={description}
                setDescription={setDescription}
                onSubmitPrompt={() => {
                    ws.current?.send(JSON.stringify({ type: "submit_prompt", name, prompt }));
                }}
                onSubmitDescription={() => {
                    ws.current?.send(JSON.stringify({
                        type: "submit_description",
                        name,
                        description,
                        chain_owner: assignedChain,
                    }));
                }}
            />
        );
    }

    if (gamePhase === "gallery") {
        return (
            <Gallery
                latestChains={latestChains}
                finalScores={finalScores}
                wantsRestart={wantsRestart}
                setWantsRestart={setWantsRestart}
                expandedImage={expandedImage}
                setExpandedImage={setExpandedImage}
                expandedPrompt={expandedPrompt}
                setExpandedPrompt={setExpandedPrompt}
                onRestart={() => {
                    ws.current?.send(JSON.stringify({ type: "restart_game" }));
                    setWantsRestart(false);
                }}
            />
        );
    }

    // Default fallback
    return <div>Loading...</div>;
};

export default GameController;
