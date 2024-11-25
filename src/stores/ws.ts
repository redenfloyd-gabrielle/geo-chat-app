import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"
import { io, Socket } from "socket.io-client"
import type { Message } from "./types"
import { useAppStore } from "./app"

const socketUrl = import.meta.env.VITE_WEBSOCKET_URL

export const useWsStore = defineStore('ws', () => {
  const socket = ref<Socket | null>(null)
  const connection_id = ref('')
  const appStore = useAppStore()

  const initializeSocketEvents = function () {
    // Listen for connection events
    socket.value?.on('connect', () => {
      connection_id.value = socket.value?.id ?? ''
      console.log(`You are connected to ws successfully with Connection ID: ${connection_id.value}`)
    })

    // Listen for message events
    socket.value?.on('message', (message: any) => {
      console.log('Message from server:', message)
      if (message.message) {
        try {
          const _message = JSON.parse(message.message) as Message
          if (_message.uuid) {
            messageListener(_message)
          }
        } catch (error) {
          console.error(error)
        }
      }
    })

    // Listen for disconnection events
    socket.value?.on('disconnect', (reason: any) => {
      console.log(`Disconnected from WebSocket. Reason: ${reason}`)
    })
  }

  const connect = function () {
    socket.value = io(socketUrl)
    initializeSocketEvents()
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect() // Disconnect the socket
      console.log('Disconnected from WebSocket')
    }
  }

  const joinChannel = function (channelName: string) {
    socket.value?.emit('joinChannel', channelName)
  }

  const leaveChannel = function (channelName: string) {
    socket.value?.emit('leaveChannel', channelName)
  }

  const sendMessage = (message: Message) => {
    if (socket.value) {
      // Emit the message to the specified channel
      const _message = JSON.stringify(message)
      socket.value.emit("message", { message: _message })
      console.log(`Message sent to channel ${message.channel_uuid}: ${_message}`)
    } else {
      console.error("WebSocket is not connected.")
    }
  }

  const messageListener = (message: Message) => {
    if (appStore.selectedChannel.uuid === message.channel_uuid) {
      appStore.selectedMessages.push(message)
    }
  }


  return {
    connect,
    disconnect,
    initializeSocketEvents,
    joinChannel,
    leaveChannel,
    sendMessage
  }
})