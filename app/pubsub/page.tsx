"use client";
import React, { useEffect, useState } from 'react';

const WSClientPage = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [joinedUsers, setJoinedusers] = useState<string[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [roomId, setRoomId] = useState('');
    const [ws, setWs] = useState<WebSocket | null>(null)

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        setWs(socket);

        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
           // setMessages(prevMessages => [...prevMessages, event.data]);
           
            if (message.type === 'joined') {
                setMessages(prevMessages => [...prevMessages, event.data]);
                console.log(`User ${message.payload.userId} joined the room.`);
            } 
            if (message.type === 'left') {
                setMessages(prevMessages => [...prevMessages, event.data]);
                console.log(`User  ${message.payload.userId} left the room.`);
            } 
            if (message.type === 'message') {
                setJoinedusers(prevMessages => [...prevMessages, event.data]);
                console.log(`User ${message.payload.userId} joined the room.`);
            } 

           
               
           
           
           
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
        };

        socket.onerror = (error) => {
            console.error('WebSocket encountered error:', error);
        };

        return () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.close();
                console.log('WebSocket connection closed');
            }
        };
    }, []);

    const joinRoom = () => {
        if (ws && roomId.trim() !== '') {
            const messageToSend = JSON.stringify({ type: 'join', payload: { roomId } });
            ws.send(messageToSend);
        }
    };

    const sendMessage = () => {
        if (ws && inputMessage.trim() !== '') {
            const messageToSend = JSON.stringify({ type: 'message', payload: { message: inputMessage } });
            ws.send(messageToSend);
            setInputMessage('');
        }
    };

    return (
        <div>
            <h1>WebSocket Client</h1>
            <div>
                <input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomId}
                    style={{
                        padding: '10px',
                        marginRight: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        width: '200px'
                    }}
                    onChange={(e) => setRoomId(e.target.value)}
                />
                <button onClick={joinRoom}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: '#007BFF',
                        color: '#fff',
                        cursor: 'pointer'
                    }}>Join Room</button>
            </div>
            <div>
                <ul>
                    {messages.map((message, index) => (
                        <li key={index}>{message}</li>
                    ))}
                </ul>
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Enter Message"
                    value={inputMessage}
                    style={{
                        padding: '10px',
                        marginRight: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        width: '200px'
                    }}
                    onChange={(e) => setInputMessage(e.target.value)}
                />
                <button onClick={sendMessage}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: '#007BFF',
                        color: '#fff',
                        cursor: 'pointer'
                    }}>Send</button>
            </div>
            <ul>
                    {joinedUsers.map((message, index) => (
                        <li key={index}>{message}</li>
                    ))}
                </ul>
        </div>
    );
};

export default WSClientPage;
