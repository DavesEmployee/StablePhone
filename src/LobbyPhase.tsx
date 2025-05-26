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

export default LobbyPhase;
