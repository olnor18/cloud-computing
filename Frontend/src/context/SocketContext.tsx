import React, { createContext, useContext, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import constansts from './../common/Constants';
import { getOrRegisterUser, UserContext } from "./UserContext";

const socketConnectionString = constansts.serverBaseURL;
let socket: Socket | null = null;

if (socketConnectionString) {
  socket = io(socketConnectionString);
}

const defaultSocket = {
  socket: socket,
}

type SocketContextProviderProps = {
  children: React.ReactNode
}

export const SocketContext = createContext(defaultSocket);

export const SocketProvider = ({children}: SocketContextProviderProps) => {
  const userContext = useContext(UserContext);

  useEffect(() => {
    const initializeUser = async () => {
      await getOrRegisterUser();

      if (socket) { 
        socket.emit('join-room', 'all');
        socket.emit('join-room', userContext.id);
      }
    }
    
    initializeUser();
  }, []);

  return (
    <SocketContext.Provider value={defaultSocket}>
      {children}
    </SocketContext.Provider>
  );
};
