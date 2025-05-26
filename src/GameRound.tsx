import React from "react";
import PlayerList from "./PlayerList";

type Player = { name: string; ready: boolean };

type GameRoundProps = {
    name: string;
    players: Player[];
    roundNumber: number;
    gamePhase: string;
    assignedChain: string | null;
    currentImage: string | null;
    prompt: string;
    setPrompt: (s: string) => void;
    description: string;
    setDescription: (s: string) => void;
    onSubmitPrompt: () => void;
    onSubmitDescription: () => void;
};

const GameRound: React.FC<GameRoundProps> = ({
    name,
    players,
    roundNumber,
    gamePhase,
    assignedChain,
    currentImage,
    prompt,
    setPrompt,
    description,
    setDescription,
    onSubmitPrompt,
    onSubmitDescription,
}) => {
    const isReady = !!players.find(p => p.name === name && p.ready);

    return (
        <div
            style={{
                maxWidth: 820,
                margin: "30px auto 40px auto",
                background: "#fafdff",
                borderRadius: 18,
                boxShadow: "0 4px 32px #d4e4fa55",
                padding: "36px 30px 44px 30px",
                minHeight: 450
            }}
        >
            <h2 style={{marginBottom: 0}}>Game - Round {roundNumber}</h2>
            <div style={{margin: "10px 0 18px 0"}}>
                <PlayerList players={players} currentName={name} />
            </div>

            {/* Round 1: Prompt entry */}
            {roundNumber === 1 && (
                <div>
                    <h3>Come up with an exciting first image!</h3>
                    <input
                        className="stable-input"
                        type="text"
                        placeholder="Write your prompt"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        disabled={isReady}
                        style={{marginRight: 8}}
                    />
                    <button
                        className="stable-btn"
                        onClick={onSubmitPrompt}
                        disabled={isReady}
                    >
                        Submit
                    </button>
                </div>
            )}

            {/* Rounds 2+ : Image description */}
            {roundNumber > 1 && assignedChain && (
                <div>
                    <h3>Describe the picture you see!</h3>
                    {currentImage ? (
                        <div style={{
                            border: "1px solid #ddd",
                            padding: 12,
                            margin: "1em 0",
                            textAlign: "center",
                            borderRadius: 8,
                            background: "#f7f7fa"
                        }}>
                            <img
                                src={`data:image/png;base64,${currentImage}`}
                                alt="AI"
                                style={{ maxWidth: 256, maxHeight: 256, borderRadius: 7, border: "1px solid #aaa" }}
                            />
                        </div>
                    ) : (
                        <div style={{margin: "1em 0", color: "#666"}}>Waiting for image...</div>
                    )}
                    <input
                        className="stable-input"
                        type="text"
                        placeholder="Your description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        disabled={isReady}
                        style={{marginRight: 8}}
                    />
                    <button
                        className="stable-btn"
                        onClick={onSubmitDescription}
                        disabled={isReady}
                    >
                        Submit
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameRound;
