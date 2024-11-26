import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"
import { io, Socket } from "socket.io-client"
import { WS_EVENT, type Coordinates, type Message, type WebsocketMessage } from "./types"
import { useAppStore } from "./app"
import { useMapStore } from "./map"

const socketUrl = import.meta.env.VITE_WEBSOCKET_URL

export const useWsStore = defineStore('ws', () => {
  const socket = ref<Socket | null>(null)
  const connection_id = ref('')
  const appStore = useAppStore()
  const mapStore = useMapStore()

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
          const _message = JSON.parse(message.message) as WebsocketMessage
          if (_message) {
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

  const sendMessage = (message: WebsocketMessage) => {
    if (socket.value) {
      // Emit the message to the specified channel
      const _message = JSON.stringify(message)
      socket.value.emit("message", { message: _message })
    } else {
      console.error("WebSocket is not connected.")
    }
  }

  const messageListener = (message: WebsocketMessage) => {
    const { event, data } = message
    if (event === WS_EVENT.MESSAGE) {
      if (appStore.selectedChannel.uuid === data.channel_uuid) {
        appStore.selectedMessages.push(data as Message)
      }
    }
    else if (event === WS_EVENT.COORDINATES) {
      if (appStore.selectedChannel.uuid === data.channel_uuid) {
        mapStore.thisCoordinates = { ...data as Coordinates }
      }
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