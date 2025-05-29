import React, { useState } from "react";
import PlayerList from "./PlayerList";

type Props = {
    name: string;
    setName: (n: string) => void;
    joined: boolean;
    setJoined: (b: boolean) => void;
    handleJoin: () => void;
    handleReady: () => void;
    players: {name: string, ready: boolean}[];
};

const LobbyPhase: React.FC<Props> = ({ name, setName, joined, setJoined, handleJoin, handleReady, players }) => {
    const [hasReadied, setHasReadied] = useState(false);

    const onJoinOrReady = () => {
        if (!joined) {
            handleJoin();
        } else {
            handleReady();
            setHasReadied(true);
        }
    };

    return (
        <div className="stable-main-container" style={{maxWidth: 420, margin: "48px auto", padding: "36px 26px"}}>
            <h2
                style={{
                    textAlign: "center",
                    marginBottom: 18,
                    fontWeight: 800,
                    fontSize: "2.1em",
                    fontFamily: "'Nunito', sans-serif",
                    letterSpacing: "-2px",
                    color: "#fff" // bright white for title
                }}
                >
                <span role="img" aria-label="phone">📞</span> StablePhone
                </h2>
                <p
                style={{
                    textAlign: "center",
                    color: "#e4eafd",         // light bluish/white for subtitle
                    fontSize: "1.09em",
                    marginBottom: 22,
                    fontWeight: 400,
                    textShadow: "0 1px 6px #355, 0 0px 2px #6666" // subtle glow for readability
                }}
                >
                Join the party and get ready to play!<br />
                Once everyone is ready, the game will begin.
                </p>

            {/* Input + button visible until "Ready" is hit */}
            {(!joined || (joined && !hasReadied)) && (
                <div style={{
                    display: "flex", alignItems: "center", margin: "0 auto 18px auto",
                    maxWidth: 320, justifyContent: "center"
                }}>
                    <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="stable-input"
                        style={{
                            borderTopRightRadius: 0, borderBottomRightRadius: 0, marginRight: 0, flex: 1
                        }}
                        onKeyDown={e => {
                            if (e.key === "Enter") onJoinOrReady();
                        }}
                        autoFocus
                        maxLength={16}
                    />
                    <button
                        className={
                            "stable-btn" +
                            (joined && !hasReadied ? " ready-shine ready-glow" : "")
                        }
                        style={{
                            borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
                            padding: "10px 26px", margin: 0
                        }}
                        onClick={onJoinOrReady}
                        disabled={!name.trim() || (!joined && players.some(p => p.name === name))}
                    >
                        {!joined ? "Join" : "Ready"}
                    </button>
                </div>
            )}
        <h3 style={{
            fontWeight: 700, fontSize: "1.13em", color: "#397", marginTop: 22, marginBottom: 6
        }}>
            Players
        </h3>
        <PlayerList players={players} currentName={name} />
        <div style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: "1.01em",
            color: "#999"
        }}>
            Waiting for everyone to be ready...
        </div>
    </div>

)};

export default LobbyPhase;
