import React from "react";
import Avatar from "boring-avatars";
import PlayerList from "./PlayerList";

type GalleryProps = {
    latestChains: any;
    finalScores: { [name: string]: number };
    wantsRestart: boolean;
    setWantsRestart: (b: boolean) => void;
    expandedImage: string | null;
    setExpandedImage: (i: string | null) => void;
    expandedPrompt: string | null;
    setExpandedPrompt: (p: string | null) => void;
    onRestart: () => void;
};

const avatarColors = ["#6C9", "#FFD166", "#EF476F", "#06D6A0", "#118AB2", "#8338EC", "#FFBE0B"];

const Gallery: React.FC<GalleryProps> = ({
    latestChains,
    finalScores,
    wantsRestart,
    setWantsRestart,
    expandedImage,
    setExpandedImage,
    expandedPrompt,
    setExpandedPrompt,
    onRestart,
}) => (
    <>
        <div className="stable-main-container" style={{ maxWidth: 820, margin: "40px auto 48px auto", minHeight: 450, padding: "36px 30px 44px 30px" }}>
            <h2 style={{marginBottom: 18, color: "#fff"}}>Game Over! Gallery</h2>
            {latestChains &&
                Object.entries(latestChains).map(([owner, steps]) => (
                    <div className="stable-main-container"
                        key={owner}
                        style={{
                            margin: "2em 0",
                            padding: "1em",
                            borderRadius: 14,
                            // background: "rgba(255,255,255,0.88)",
                            boxShadow: "0 2px 12px #ddeefc66",
                            border: "none"
                        }}
                    >
                        <h3 style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 8, color: "#495"}}>
                            <Avatar
                                size={28}
                                name={owner}
                                variant="beam"
                                square={false}
                                colors={avatarColors}
                            />
                            <span style={{fontWeight: 600}}>{owner}&rsquo;s Gallery</span>
                        </h3>
                        <div
                            style={{
                                display: "flex",
                                overflowX: "auto",
                                gap: 24,
                                padding: "8px 0",
                                justifyContent: "space-evenly"
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
                                        // background: "#fff",
                                        // border: "1px solid #e2e2e2",
                                        borderRadius: 8,
                                        // boxShadow: "0 1px 4px #eee",
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
                                                // border: "1px solid #aaa"
                                            }}
                                        />
                                    )}
                                    <div style={{
                                        marginTop: 6,
                                        fontSize: "0.95em",
                                        color: "#223",
                                        fontWeight: 500,
                                        // background: "#f7f7fa",
                                        borderRadius: 4,
                                        padding: "2px 4px",
                                        minHeight: 28,
                                        display: "inline-block",   // so background hugs text if you want
                                        maxWidth: 128,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    }}>
                                        <span style={{fontWeight: 700, color: "#495"}}>{step.player}</span>
                                        <span style={{marginLeft: 4, color: "#fff"}}>“{step.prompt}”</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            }

            {finalScores && Object.keys(finalScores).length > 0 && (
                <div style={{marginTop: 24, color: "#fff"}}>
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
                                                size={20}
                                                name={player}
                                                variant="beam"
                                                square={false}
                                                colors={avatarColors}
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

            

            {/* Restart logic */}
            {!wantsRestart ? (
                <div style={{ textAlign: "center", marginTop: 32 }}>
                    <button className="stable-btn" style={{marginTop: 24}} onClick={() => setWantsRestart(true)}>
                        Restart Game
                    </button>
                </div>
            ) : (
                <div
                    style={{
                        textAlign: "center",
                        marginTop: 32,
                        color: "#e32b2b",
                        // fontWeight: 700,
                        fontSize: "1.12em",
                        textShadow: `
                        -1px -1px 0 #8a8a8a,
                        1px -1px 0 #8a8a8a,
                        -1px 1px 0 #8a8a8a,
                        1px 1px 0 #8a8a8a
                        `
                    }}
                    >
                    <p>Are you sure you want to restart? This will reset the lobby and all players will need to join again.</p>
                    <button className="stable-btn" style={{marginRight: 10}} onClick={onRestart}>
                        Confirm Restart
                    </button>
                    <button className="stable-btn" onClick={() => setWantsRestart(false)}>Cancel</button>
                </div>
            )}
        </div>
        {/* Lightbox modal */}
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
                        // background: "#fff",
                        padding: 20,
                        borderRadius: 12,
                        // boxShadow: "0 2px 20px #3338",
                        maxWidth: "90vw",
                        maxHeight: "90vh",
                        textAlign: "center",
                        position: "relative"
                    }}
                >
                    <img
                        src={`data:image/png;base64,${expandedImage}`}
                        alt="Expanded"
                        style={{maxWidth: "80vw", maxHeight: "70vh", borderRadius: 8}}
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
    </>
);

export default Gallery;
