import { Routes, Route } from "react-router-dom";
import "./App.css";
import Authentication from "./components/Authentication/Authentication";
import { Home } from "./components/Home/Home";
import  { RoomPage }  from "./components/Video/Room";
import { useEffect, useState } from "react";

function App() {

  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    const handlePageLoad = () => {
      setPageLoaded(true);
    };

    // Add event listener for the page load event
    window.addEventListener('load', handlePageLoad);

    // Cleanup: Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('load', handlePageLoad);
    };
  }, []);

  useEffect(()=>{
      console.log(pageLoaded)
  })

  return (
    <div className="App">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/login" element={<Authentication />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
        </Routes>
    </div>
  );
}

export default App;
