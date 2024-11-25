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
import { HTTP_RESPONSE_STATUS, type Friend, type Message } from "./types"
/* -------------------------- END OTHER IMPORTS ---------------------------- */




export const useFriendshipStore = defineStore('friendship', () => {
  /* --------------------------------- STORES ------------------------------- */
  const appStore = useAppStore()
  /* ------------------------------ END STORES ------------------------------ */

  /* --------------------------------- STATES ------------------------------- */
  const friendships = ref([] as Friend[])
  const thisFriendship = ref({} as Message)
  const selectedFriendship = ref({} as Message)
  /* ------------------------------ END STATES ------------------------------ */

  /* -------------------------------- COMPUTED ------------------------------ */
  /* ------------------------------ END COMPUTED ---------------------------- */

  /* -------------------------------- WATCHERS ------------------------------ */
  /* ------------------------------ END WATCHERS ---------------------------- */

  /* --------------------------------- METHODS ------------------------------ */

  const getFriendByUserUuid = async (user_uuid: string): Promise<Friend[] | undefined> => {
    if (!user_uuid) {
      console.error('@___ Missing uuid in payload')
      return undefined
    }

    try {
      const response = await appStore.handleApiRequest(appStore.api.get(`v1/friendships/user_uuid/${user_uuid}`))

      if ('error' in response) {
        console.error(`@___ Error on retrieving friendship :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Retrieved friendship successfully ::`, response.data)
      return response.data as Friend[]
    } catch (error) {
      console.error(`@___ Unexpected error on retrieving friendship :: ${error}`)
      return undefined
    }
  }


  const addFriend = async (payload: Friend): Promise<Friend | undefined> => {
    try {
      const response = await appStore.handleApiRequest(appStore.api.post(`v1/friendships`, payload))

      if ('error' in response) {
        console.error(`@___ Error on adding friendship :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Added friendship successfully ::`, response.data)
      return response.data as Friend
    } catch (error) {
      console.error(`@___ Unexpected error on adding friendship :: ${error}`)
      return undefined
    }
  }


  const deleteFriend = async (payload: Message) => {
    const _message = friendships.value.find((message) => message.uuid === payload.uuid)
    if (!_message) {
      console.error(`@___ Message not found with uuid: ${payload.uuid}`)
      return undefined
    }

    try {
      const response = await appStore.handleApiRequest(appStore.api.delete(`v1/frienships/${payload.uuid}`))
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
    friendships,
    getFriendByUserUuid,
    addFriend,
    deleteFriend,
  }
})