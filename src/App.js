import { Routes, Route } from "react-router-dom";
import "./App.css";
import Authentication from "./components/Authentication/Authentication";
import { Home } from "./components/Home/Home";
import  { RoomPage }  from "./components/Video/Room";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route  exact path="/" element={<Home />} />
        <Route exact path="/login" element={<Authentication />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </div>
  );
}

export default App;
