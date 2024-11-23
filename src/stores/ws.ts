import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { io, Socket } from "socket.io-client";

const socketUrl = import.meta.env.VITE_WEBSOCKET_URL

export const useWsStore = defineStore('ws', () => {
  const socket = ref<Socket | null>(null);
  const connection_id = ref('')

  const initializeSocketEvents = function () {
    // Listen for connection events
    socket.value?.on('connect', () => {
      connection_id.value = socket.value?.id ?? '';
      console.log(`You are connected to ws successfully with Connection ID: ${connection_id.value}`);
    });

    // Listen for message events
    socket.value?.on('message', (message: any) => {
      console.log('Message from server:', message);
    });

    // Listen for disconnection events
    socket.value?.on('disconnect', (reason: any) => {
      console.log(`Disconnected from WebSocket. Reason: ${reason}`);
    });
  }

  const connect = function () {
    socket.value = io(socketUrl);
    initializeSocketEvents()
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect(); // Disconnect the socket
      console.log('Disconnected from WebSocket');
    }
  };

  const joinChannel = function (channelName: string) {
    socket.value?.emit('joinChannel', channelName)
  }

  const leaveChannel = function (channelName: string) {
    socket.value?.emit('leaveChannel', channelName)
  }



  return {
    connect,
    disconnect,
    initializeSocketEvents,
    joinChannel,
    leaveChannel,
  }
})