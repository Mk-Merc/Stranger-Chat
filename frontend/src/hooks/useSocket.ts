import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Filter } from 'bad-words';

const profanityFilter = new Filter();

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL; 

export type AppState = 'HOME' | 'WAITING' | 'CHATTING';

export const useSocket = () => {
  const [deviceID, setDeviceID] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [appState, setAppState] = useState<AppState>('HOME');
  const [strangerDeviceID, setStrangerDeviceID] = useState<string | null>(null);
  // [] = turns the object into an array
  // ([]) = initial value, starts with none
  const [messages, setMessages] = useState<{ id: string, text: string, sender: 'ME' | 'STRANGER', time: string }[]>([]);
  const [chatEndedMessage, setChatEndedMessage] = useState<string | null>(null);

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
    newSocket.on('disconnect', () => {
      setAppState('HOME');
      setMessages([]);

      setChatEndedMessage("You have been disconnected because you left the app or lost connection.");
    });

    newSocket.on('waiting', () => setAppState('WAITING'));
    newSocket.on('matched', (data: { roomID: string, strangerDeviceID: string }) => {
      setAppState('CHATTING');
      setMessages([]);
      setStrangerDeviceID(data.strangerDeviceID);
    });

    newSocket.on('receive_message', (data: { message: string }) => {
      // ... = spread operator, unpacks the previous messages and puts them into the new array
      // It keeps the message list flat (prevent nested arrays) by unpacking the old messages before adding the new one
      setMessages((previousMessages) => [...previousMessages, { 
        id: Date.now().toString(), 
        text: data.message, 
        sender: 'STRANGER',
        time: new Date().toISOString()
      }]);
    });

    newSocket.on('chat_ended', (data: { message: string }) => {
      setChatEndedMessage(data.message);
      setAppState('HOME');
    });

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

  const cancelSearch = () => {
    if (socket) {
      socket.emit('cancel_search');
    }
    setAppState('HOME');
  };

  const sendMessage = (text: string) => {
    if (socket && text.trim() !== '') {
      const cleanText = profanityFilter.clean(text);

      socket.emit('send_message', { message: cleanText });

      setMessages((previousMessages) => [...previousMessages, { 
        id: Date.now().toString(), 
        text: cleanText, 
        sender: 'ME',
        time: new Date().toISOString()
      }]);
    }
  };

  const blockStranger = () => {
  if (socket && strangerDeviceID) {
    socket.emit('block_user', { blockedDeviceID: strangerDeviceID });
  }
  };
  
  const disconnect = () => {
    if (socket) {
      // If the user is in chat, disconnect from the room
      socket.emit('leave_chat'); 
    }
  };

  // Clear the chat ended message after it has been displayed to the user
  const clearChatEndedMessage = () => setChatEndedMessage(null);

  return { 
    appState,
    findStranger, 
    disconnect,
    strangerDeviceID,
    messages, 
    chatEndedMessage, 
    cancelSearch,
    sendMessage, 
    clearChatEndedMessage,
    blockStranger
  };
};