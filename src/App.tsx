import React from "react";
import GameController from "./GameController";
import Silk from "./Backgrounds/Silk"
import './App.css';

function App() {
    return (
        <>
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 0,
                pointerEvents: "none",
            }}
            >
            <Silk
                speed={5}
                scale={0.75}
                color="#AE8DC8"
                noiseIntensity={1.2}
                rotation={5}
            />
        </div>
            <div style={{
                position: "relative",
                zIndex: 2,
                minHeight: "100vh"
            }}>
                <GameController />
            </div>
        </>
    );
}

export default App;
