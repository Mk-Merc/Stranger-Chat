import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL; 

export type AppState = 'HOME' | 'WAITING' | 'CHATTING';

export const useSocket = () => {
  const [deviceID, setDeviceID] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [appState, setAppState] = useState<AppState>('HOME');

  useEffect(() => {
    const getDeviceID = async () => {
      let id = await AsyncStorage.getItem('deviceID');

      if (!id) {
        id = Crypto.randomUUID();

        await AsyncStorage.setItem('deviceID', id);
      }
      setDeviceID(id);
    };
    getDeviceID();
  }, []);

  useEffect(() => {
    if (!deviceID) return;
    
    // Socket is created here only
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => console.log('Socket Connected!'));
    newSocket.on('connect_error', (err) => console.log('Socket Error:', err.message));

    newSocket.on('waiting', () => setAppState('WAITING'));
    newSocket.on('matched', () => setAppState('CHATTING'));

    // Clean function to disconnect the socket when the component unmounts or deviceID changes
    // This is considered as clean function when placed inside useEffect
    return () => { 
      newSocket.disconnect(); 
    };
    // Re-run when deviceID changes
  }, [deviceID]);

  const findStranger = () => { 
    // Backend expects deviceID
    if (socket && deviceID) {
      socket.emit('find_stranger', { deviceID: deviceID });
    }
  };
  
  const disconnect = () => setAppState('HOME');

  return { appState, findStranger, disconnect };
};