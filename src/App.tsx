import React from "react";
import Lobby from "./Lobby";

const App: React.FC = () => {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1>StablePhone 📞</h1>
      <Lobby />
    </div>
  );
};

export default App;
