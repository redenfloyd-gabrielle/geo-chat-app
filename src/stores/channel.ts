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
import { HTTP_RESPONSE_STATUS, type Channel } from "./types"
/* -------------------------- END OTHER IMPORTS ---------------------------- */




export const useChannelStore = defineStore('channel', () => {
  /* --------------------------------- STORES ------------------------------- */
  const appStore = useAppStore()
  /* ------------------------------ END STORES ------------------------------ */

  /* --------------------------------- STATES ------------------------------- */
  const channels = ref([] as Channel[])
  const thisChannel = ref({} as Channel)
  const selectedChannel = ref({} as Channel)
  /* ------------------------------ END STATES ------------------------------ */

  /* -------------------------------- COMPUTED ------------------------------ */
  /* ------------------------------ END COMPUTED ---------------------------- */

  /* -------------------------------- WATCHERS ------------------------------ */
  /* ------------------------------ END WATCHERS ---------------------------- */

  /* --------------------------------- METHODS ------------------------------ */
  const getChannels = async (): Promise<Channel[] | undefined> => {
    try {
      const response = await appStore.handleApiRequest(appStore.api.get(`v1/channels`))

      if ('error' in response) {
        console.error(`@___ Error on retrieving channels :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Retrieved channels successfully ::`, response.data)
      return response.data as Channel[]
    } catch (error) {
      console.error(`@___ Unexpected error on retrieving channels :: ${error}`)
      return undefined
    }
  }

  const getChannel = async (payload: Channel): Promise<Channel | undefined> => {
    // Check locally for the channel first
    let channel = channels.value.find((_channel) => _channel.uuid === payload.uuid)

    // If not found locally, attempt to fetch from the server
    if (!channel) {
      channel = await getChannelByUuid(payload)
      if (!channel) {
        console.error(`@___ Channel not found with uuid: ${payload.uuid}`)
      }
    }

    return channel
  }

  const getChannelByUuid = async (payload: Channel): Promise<Channel | undefined> => {
    const { uuid } = payload

    if (!uuid) {
      console.error('@___ Missing uuid in payload')
      return undefined
    }

    try {
      const response = await appStore.handleApiRequest(appStore.api.get(`v1/channels/${uuid}`))

      if ('error' in response) {
        console.error(`@___ Error on retrieving channel :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Retrieved channel successfully ::`, response.data)
      return response.data as Channel
    } catch (error) {
      console.error(`@___ Unexpected error on retrieving channel :: ${error}`)
      return undefined
    }
  }

  const getChannelsByUser = async (user_uuid: string): Promise<Channel[] | undefined> => {
    if (!user_uuid) {
      console.error('@___ Missing uuid in payload')
      return undefined
    }

    try {
      const response = await appStore.handleApiRequest(appStore.api.get(`v1/channels/user_uuid/${user_uuid}`))

      if ('error' in response) {
        console.error(`@___ Error on retrieving channel :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Retrieved channel successfully ::`, response.data)
      return response.data as Channel[]
    } catch (error) {
      console.error(`@___ Unexpected error on retrieving channel :: ${error}`)
      return undefined
    }
  }

  const addChannel = async (payload: Channel): Promise<Channel | undefined> => {
    try {
      const response = await appStore.handleApiRequest(appStore.api.post(`v1/channels`, payload))

      if ('error' in response) {
        console.error(`@___ Error on adding channel :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Added channel successfully ::`, response.data)
      return response.data as Channel
    } catch (error) {
      console.error(`@___ Unexpected error on adding channel :: ${error}`)
      return undefined
    }
  }

  const updateChannel = async (payload: Channel): Promise<Channel | undefined> => {
    const _channel = channels.value.find((channel) => channel.uuid === payload.uuid)
    if (!_channel) {
      console.error(`@___ Channel not found with uuid: ${payload.uuid}`)
      return undefined
    }

    try {
      const response = await appStore.handleApiRequest(appStore.api.put(`v1/channels/${_channel.uuid}`, payload))
      if ('error' in response) {
        console.error(`@___ Error on updating channel :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Updated channel successfully ::`, response.data)
      return response.data as Channel
    } catch (error) {
      console.error(`@___ Unexpected error on updating channel :: ${error}`)
      return undefined
    }
  }

  const saveChannel = async (payload: Channel): Promise<Channel | undefined> => {
    return payload.uuid ? await updateChannel(payload) : await addChannel(payload)
  }

  const deleteChannel = async (payload: Channel) => {
    const _channel = channels.value.find((channel) => channel.uuid === payload.uuid)
    if (!_channel) {
      console.error(`@___ Channel not found with uuid: ${payload.uuid}`)
      return undefined
    }

    try {
      const response = await appStore.handleApiRequest(appStore.api.delete(`v1/channels/${payload.uuid}`))
      if ('error' in response) {
        console.error(`@___ Error on deleting channel :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Deleted channel successfully ::`, response.data)
      return response.data as Channel
    } catch (error) {
      console.error(`@___ Unexpected error on updating channel :: ${error}`)
      return undefined
    }
  }
  /* ------------------------------ END METHODS ----------------------------- */

  return {
    channels,
    thisChannel,
    selectedChannel,
    getChannels,
    getChannel,
    getChannelByUuid,
    addChannel,
    updateChannel,
    saveChannel,
    deleteChannel,
    getChannelsByUser
  }
})