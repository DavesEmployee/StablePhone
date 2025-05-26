import React from "react";
import Avatar from "boring-avatars";

type Player = { name: string; ready: boolean };
type PlayerListProps = { players: Player[], currentName?: string };

const PlayerList: React.FC<PlayerListProps> = ({ players, currentName }) => (
    <ul style={{margin: 0, padding: 0, listStyle: "none"}}>
        {players.map(player => (
            <li key={player.name}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 5,
                    fontWeight: player.name === currentName ? 600 : 400,
                    color: player.ready ? "#15803d" : "#555"
                }}
            >
                <Avatar
                    size={20}
                    name={player.name}
                    variant="beam"
                    square={false}
                    colors={["#6C9", "#FFD166", "#EF476F", "#06D6A0", "#118AB2", "#8338EC", "#FFBE0B"]}
                />
                <span>{player.name}</span>
                <span style={{marginLeft: 5, fontSize: 16}}>
                    {player.ready ? "✅" : "⌛"}
                </span>
                {player.name === currentName && (
                    <span style={{marginLeft: 5, fontStyle: "italic", color: "#666"}}>(You)</span>
                )}
            </li>
        ))}
    </ul>
);

export default PlayerList;
