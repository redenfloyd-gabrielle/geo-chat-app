import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { io } from "socket.io-client";

export const useWsStore = defineStore('ws', () => {


  const socket = ref({})
  const connection_id = ref('')
  const socket_url = 'http://localhost:3000' // will move to .env file
  // Connect to the Socket.IO server
  const connect = function () {
    socket.value = io(socket_url);
    initializeSocketEvents()
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect(); // Disconnect the socket
      console.log('Disconnected from WebSocket');
    }
  };

  const joinChannel = function (channelName) {
    socket.value.emit('joinChannel', channelName)
  }

  const leaveChannel = function (channelName) {
    socket.value.emit('leaveChannel', channelName)
  }

  // Listen for incoming messages
  const initializeSocketEvents = function () {
    // Listen for connection events
    socket.value.on('connect', () => {
      connection_id.value = socket.value.id;
      console.log(`You are connected to ws successfully with Connection ID: ${connection_id.value}`);
    });

    // Listen for message events
    socket.value.on('message', (message) => {
      console.log('Message from server:', message);
    });

    // Listen for disconnection events
    socket.value.on('disconnect', (reason) => {
      console.log(`Disconnected from WebSocket. Reason: ${reason}`);
    });
  }

  return {
    socket,
    connect,
    disconnect,
    initializeSocketEvents,
    joinChannel,
    leaveChannel,
  }
})