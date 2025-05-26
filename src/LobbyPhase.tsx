import React from "react";
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

const LobbyPhase: React.FC<Props> = ({ name, setName, joined, setJoined, handleJoin, handleReady, players }) => (
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
        <h2>📞 Welcome to StablePhone!</h2>
        {!joined && (
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 12 }}>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="stable-input"
                    style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, marginRight: 0 }}
                    onKeyDown={e => {
                        if (e.key === "Enter") handleJoin();
                    }}
                />
                <button
                    className="stable-btn"
                    style={{
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        padding: "10px 26px",
                        margin: 0
                    }}
                    onClick={handleJoin}
                >
                    Join
                </button>
            </div>

        )}
        {joined && (
            <div>
                <button className="stable-btn" onClick={handleReady}>Ready</button>
            </div>
        )}
        <h3>Players</h3>
        <PlayerList players={players} currentName={name} />
    </div>
);

export default LobbyPhase;
