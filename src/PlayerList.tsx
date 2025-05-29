import React, { useEffect, useState } from "react";
import Avatar from "boring-avatars";

type Player = { name: string; ready: boolean };
type PlayerListProps = { players: Player[]; currentName?: string };

const ANIMATION_DURATION = 420; // ms

const PlayerList: React.FC<PlayerListProps> = ({ players, currentName }) => {
    const [animatedReady, setAnimatedReady] = useState<{ [name: string]: boolean }>({});

    useEffect(() => {
        players.forEach(player => {
            // Animate only when transitioning from not-ready to ready
            if (player.ready && !animatedReady[player.name]) {
                setAnimatedReady(prev => ({ ...prev, [player.name]: true }));
                setTimeout(() => {
                    setAnimatedReady(prev => ({ ...prev, [player.name]: false }));
                }, ANIMATION_DURATION);
            }
        });
        // eslint-disable-next-line
    }, [players]);

    return (
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {players.map(player => (
                <li
                    key={player.name}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 9,
                        fontWeight: player.name === currentName ? 700 : 500,
                        color: "#384",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Avatar
                            size={22}
                            name={player.name}
                            variant="beam"
                            square={false}
                            colors={["#6C9", "#FFD166", "#EF476F", "#06D6A0", "#118AB2", "#8338EC", "#FFBE0B"]}
                            className={animatedReady[player.name] ? "avatar-pop" : ""}
                        />
                        <span>{player.name}</span>
                        {player.name === currentName && (
                            <span style={{ marginLeft: 4, fontStyle: "italic", color: "#888" }}>(You)</span>
                        )}
                    </div>
                    <span style={{
                        fontSize: "0.97em",
                        fontWeight: 600,
                        padding: "2.5px 14px",
                        borderRadius: 12,
                        background: player.ready ? "#27c77a22" : "#ffd36633",
                        color: player.ready ? "#1b8c4b" : "#b67d0c",
                        border: `1.5px solid ${player.ready ? "#1b8c4b" : "#ffc366"}`,
                        minWidth: 70,
                        textAlign: "center",
                        letterSpacing: 0.2
                    }}>
                        {player.ready ? "Ready!" : "Waiting..."}
                    </span>
                </li>
            ))}
        </ul>
    );
};

export default PlayerList;
