import React, { createContext, useMemo, useContext, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const socket = useMemo(() => io("http://localhost:8000"), []);

  const [userDetails, setUserDetails] = useState({name:localStorage.getItem("username"),email:localStorage.getItem("email")})
  const [isAdmin, setIsAdmin] = useState(false)

  return (
    <SocketContext.Provider value={{socket, userDetails, setUserDetails, isAdmin, setIsAdmin}}>
      {props.children}
    </SocketContext.Provider>
  );
};
