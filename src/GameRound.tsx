import React, { useEffect, useState } from "react";
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

    const [expandedImage, setExpandedImage] = useState<string | null>(null);

    const [imgTransitioning, setImgTransitioning] = useState(false);
    const [displayedImage, setDisplayedImage] = useState<string | null>(currentImage);

    // Fade out then update image then fade in
    useEffect(() => {
        if (currentImage !== displayedImage) {
            setImgTransitioning(true);
            setTimeout(() => {
                setDisplayedImage(currentImage);
                setImgTransitioning(false);
            }, 250); // 250ms fade
        }
        // eslint-disable-next-line
    }, [currentImage]);

    return (
        <>
            <div
                className="stable-main-container"
                style={{
                        maxWidth: 420,
                        textAlign: "center",
                        marginBottom: 18,
                        fontWeight: 800,
                        // fontSize: "2.1em",
                        fontFamily: "'Nunito', sans-serif",
                        letterSpacing: "-2px",
                        color: "#fff" // bright white for title
                    }}
            >
                <h2 style={{
                    marginBottom: 6,
                    color: "#1d3557",
                    fontWeight: 800,
                    // fontSize: "1.85em",
                    textAlign: "center"
                }}>
                    Game - Round {roundNumber}
                </h2>
                

                {/* Round 1: Prompt entry */}
                {roundNumber === 1 && (
                    <div>
                        <h3 style={{
                            marginTop: 12,
                            marginBottom: 18,
                            textAlign: "center",
                            fontWeight: 700,
                            color: "#1976d2"
                        }}>
                            Come up with an exciting first image!
                        </h3>
                        {!isReady && (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                maxWidth: 340,
                                margin: "0 auto 18px auto"
                            }}>
                                <input
                                    className="stable-input"
                                    type="text"
                                    placeholder="Write your prompt"
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    disabled={isReady}
                                    style={{
                                        borderTopRightRadius: 0,
                                        borderBottomRightRadius: 0,
                                        flex: 1,
                                        marginRight: 0
                                    }}
                                    onKeyDown={e => e.key === "Enter" && onSubmitPrompt()}
                                    maxLength={120}
                                />
                                <button
                                    className="stable-btn"
                                    style={{
                                        borderTopLeftRadius: 0,
                                        borderBottomLeftRadius: 0,
                                        margin: 0
                                    }}
                                    onClick={onSubmitPrompt}
                                    disabled={isReady}
                                >
                                    Submit
                                </button>
                            </div>
                        )}
                        {isReady && (
                            <div style={{textAlign: "center", margin: "24px 0", color: "#28a745", fontWeight: 700, fontSize: "1.08em"}}>
                                Waiting for others to finish...
                            </div>
                        )}
                    </div>
                )}

                {/* Rounds 2+ : Image description */}
                {roundNumber > 1 && assignedChain && (
                    <div>
                        <h3 style={{
                            marginTop: 8,
                            marginBottom: 18,
                            textAlign: "center",
                            fontWeight: 700,
                            color: "#1976d2"
                        }}>
                            Describe the picture you see!
                        </h3>
                        {displayedImage ? (
                            <div
                                style={{
                                    // border: "1px solid #ddd",
                                    padding: 12,
                                    // borderRadius: 12,
                                    // background: "#f7fafd",
                                    // boxShadow: "0 2px 12px #bbeef933",
                                    marginBottom: 14,
                                    textAlign: "center",
                                    cursor: "pointer"
                                }}
                                onClick={() => setExpandedImage(displayedImage)}
                                title="Click to expand"
                            >
                                <img
                                    src={`data:image/png;base64,${displayedImage}`}
                                    alt="AI"
                                    className={`fade-img${imgTransitioning ? " out" : ""}`}
                                    style={{
                                        maxWidth: 256,
                                        maxHeight: 256,
                                        borderRadius: 10,
                                        // border: "1.5px solid #aac",
                                        transition: "box-shadow 0.18s"
                                    }}
                                />
                                <div style={{
                                    fontSize: "0.88em",
                                    color: "#6e789a",
                                    marginTop: 6
                                }}>
                                    (Click to enlarge)
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                margin: "1em 0",
                                color: "#666",
                                textAlign: "center"
                            }}>
                                Waiting for image...
                            </div>
                        )}

                        {!isReady && (
                        <div className={`fade-inout${isReady ? " hide" : ""}`} style={{
                            display: "flex",
                            alignItems: "stretch",
                            justifyContent: "center",
                            maxWidth: 340,
                            margin: "0 auto 18px auto"
                        }}>
                            <input
                                className="stable-input"
                                type="text"
                                placeholder={roundNumber === 1 ? "Write your prompt" : "Your description"}
                                value={roundNumber === 1 ? prompt : description}
                                onChange={e => roundNumber === 1 ? setPrompt(e.target.value) : setDescription(e.target.value)}
                                disabled={isReady}
                                style={{
                                    borderTopRightRadius: 0,
                                    borderBottomRightRadius: 0,
                                    flex: 1,
                                    marginRight: 0
                                }}
                                onKeyDown={e => e.key === "Enter" && (roundNumber === 1 ? onSubmitPrompt() : onSubmitDescription())}
                                maxLength={120}
                            />
                            <button
                                className="stable-btn"
                                style={{
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0,
                                    margin: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                                onClick={roundNumber === 1 ? onSubmitPrompt : onSubmitDescription}
                                disabled={isReady}
                            >
                                Submit
                            </button>
                        </div>
                        )}
                        {isReady && (
                            <div className={`fade-inout${!isReady ? " hide" : ""}`} style={{textAlign: "center", margin: "24px 0", color: "#28a745", fontWeight: 700, fontSize: "1.08em"}}>
                                Waiting for others to finish...
                            </div>
                        )}
                        
                    </div>
                )}
                <div style={{margin: "10px 0 22px 0"}}>
                    <PlayerList players={players} currentName={name} />
                </div>
            
            </div>
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
                        justifyContent: "center",
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
                        onClick={e => e.stopPropagation()}
                    >
                        <img
                            src={`data:image/png;base64,${expandedImage}`}
                            alt="Expanded"
                            style={{
                                maxWidth: "80vw",
                                maxHeight: "70vh",
                                borderRadius: 8,
                                border: "1px solid #aaa",
                                boxShadow: "0 1px 10px #4444"
                            }}
                        />
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
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default GameRound;
