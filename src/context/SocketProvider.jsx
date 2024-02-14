import React, { createContext, useMemo, useContext, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const socket = useMemo(() => io(`${process.env.REACT_APP_BASE_URL}`), []);
  const [userDetails, setUserDetails] = useState({name:localStorage.getItem("username"),email:localStorage.getItem("email")})
  const [isAdmin, setIsAdmin] = useState(false)

  return (
    <SocketContext.Provider value={{socket, userDetails, setUserDetails, isAdmin, setIsAdmin}}>
      {props.children}
    </SocketContext.Provider>
  );
};
