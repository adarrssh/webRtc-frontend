import React, { createContext, useMemo, useContext, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const socket = useMemo(() => io("https://one-to-one-video-service.onrender.com"), []);

  const [userDetails, setUserDetails] = useState({name:"Adarsh",email:"adarsh00502@gmail.com"})

  return (
    <SocketContext.Provider value={{socket, userDetails, setUserDetails}}>
      {props.children}
    </SocketContext.Provider>
  );
};
