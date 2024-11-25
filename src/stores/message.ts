/* ------------------------------- VUE IMPORTS ----------------------------- */
import { defineStore } from "pinia"
import { ref } from "vue"
/* ----------------------------- END VUE IMPORTS --------------------------- */

/* ----------------------------- STORE IMPORTS ----------------------------- */
import { useAppStore } from "./app"
/* -------------------------- END STORE IMPORTS ---------------------------- */

/* --------------------------- PACKAGE IMPORTS ----------------------------- */
/* ------------------------- END PACKAGE IMPORTS --------------------------- */

/* ---------------------------- OTHER IMPORTS ------------------------------ */
import { HTTP_RESPONSE_STATUS, type Message } from "./types"
/* -------------------------- END OTHER IMPORTS ---------------------------- */




export const useMessageStore = defineStore('message', () => {
  /* --------------------------------- STORES ------------------------------- */
  const appStore = useAppStore()
  /* ------------------------------ END STORES ------------------------------ */

  /* --------------------------------- STATES ------------------------------- */
  const messages = ref([] as Message[])
  const thisMessage = ref({} as Message)
  const selectedMessage = ref({} as Message)
  /* ------------------------------ END STATES ------------------------------ */

  /* -------------------------------- COMPUTED ------------------------------ */
  /* ------------------------------ END COMPUTED ---------------------------- */

  /* -------------------------------- WATCHERS ------------------------------ */
  /* ------------------------------ END WATCHERS ---------------------------- */

  /* --------------------------------- METHODS ------------------------------ */
  const getMessages = async (): Promise<Message[] | undefined> => {
    try {
      const response = await appStore.handleApiRequest(appStore.api.get(`/messages`))

      if ('error' in response) {
        console.error(`@___ Error on retrieving messages :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Retrieved messages successfully ::`, response.data)
      return response.data as Message[]
    } catch (error) {
      console.error(`@___ Unexpected error on retrieving messages :: ${error}`)
      return undefined
    }
  }

  const getMessage = async (payload: Message): Promise<Message | undefined> => {
    // Check locally for the message first
    let message = messages.value.find((_message) => _message.uuid === payload.uuid)

    // If not found locally, attempt to fetch from the server
    if (!message) {
      message = await getMessageByUuid(payload)
      if (!message) {
        console.error(`@___ Message not found with uuid: ${payload.uuid}`)
      }
    }

    return message
  }

  const getMessageByUuid = async (payload: Message): Promise<Message | undefined> => {
    const { uuid } = payload

    if (!uuid) {
      console.error('@___ Missing uuid in payload')
      return undefined
    }

    try {
      const response = await appStore.handleApiRequest(appStore.api.get(`/messages/${uuid}`))

      if ('error' in response) {
        console.error(`@___ Error on retrieving message :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Retrieved message successfully ::`, response.data)
      return response.data as Message
    } catch (error) {
      console.error(`@___ Unexpected error on retrieving message :: ${error}`)
      return undefined
    }
  }

  const getMessageByChannel = async (channel_uuid: string): Promise<Message[] | undefined> => {
    if (!channel_uuid) {
      console.error('@___ Missing uuid in payload')
      return undefined
    }

    try {
      const response = await appStore.handleApiRequest(appStore.api.get(`v1/messages/channel_uuid/${channel_uuid}`))

      if ('error' in response) {
        console.error(`@___ Error on retrieving message :: ${response.error}`)
        return undefined
      }

      const messages = response.data.map((d: any) => d.message)

      console.log(`@___ Retrieved message successfully ::`, response.data, messages)
      return response.data as Message[]
    } catch (error) {
      console.error(`@___ Unexpected error on retrieving message :: ${error}`)
      return undefined
    }
  }

  const addMessage = async (payload: Message): Promise<Message | undefined> => {
    try {
      const response = await appStore.handleApiRequest(appStore.api.post(`v1/messages`, payload))

      if ('error' in response) {
        console.error(`@___ Error on adding message :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Added message successfully ::`, response.data)
      return response.data as Message
    } catch (error) {
      console.error(`@___ Unexpected error on adding message :: ${error}`)
      return undefined
    }
  }

  const updateMessage = async (payload: Message): Promise<Message | undefined> => {
    const _message = messages.value.find((message) => message.uuid === payload.uuid)
    if (!_message) {
      console.error(`@___ Message not found with uuid: ${payload.uuid}`)
      return undefined
    }

    try {
      const response = await appStore.handleApiRequest(appStore.api.put(`/messages/${_message.uuid}`, payload))
      if ('error' in response) {
        console.error(`@___ Error on updating message :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Updated message successfully ::`, response.data)
      return response.data as Message
    } catch (error) {
      console.error(`@___ Unexpected error on updating message :: ${error}`)
      return undefined
    }
  }

  const saveMessage = async (payload: Message): Promise<Message | undefined> => {
    return payload.uuid ? await updateMessage(payload) : await addMessage(payload)
  }

  const deleteMessage = async (payload: Message) => {
    const _message = messages.value.find((message) => message.uuid === payload.uuid)
    if (!_message) {
      console.error(`@___ Message not found with uuid: ${payload.uuid}`)
      return undefined
    }

    try {
      const response = await appStore.handleApiRequest(appStore.api.delete(`/messages/${payload.uuid}`))
      if ('error' in response) {
        console.error(`@___ Error on deleting message :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Deleted message successfully ::`, response.data)
      return response.data as Message
    } catch (error) {
      console.error(`@___ Unexpected error on updating message :: ${error}`)
      return undefined
    }
  }
  /* ------------------------------ END METHODS ----------------------------- */

  return {
    messages,
    thisMessage,
    selectedMessage,
    getMessages,
    getMessage,
    getMessageByUuid,
    addMessage,
    updateMessage,
    saveMessage,
    deleteMessage,
    getMessageByChannel
  }
})