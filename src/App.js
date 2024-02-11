import { Routes, Route } from "react-router-dom";
import "./App.css";
import LobbyScreen from "./screens/Lobby";
import RoomPage from "./screens/Room";
import Authentication from "./components/Authentication/Authentication";
import { Home } from "./components/Home/Home";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route  exact path="/" element={<LobbyScreen />} />
        <Route  exact path="/home" element={<Home />} />
        <Route exact path="/login" element={<Authentication />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </div>
  );
}

export default App;
