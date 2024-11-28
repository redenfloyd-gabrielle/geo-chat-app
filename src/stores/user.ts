/* ------------------------------- VUE IMPORTS ----------------------------- */
import { defineStore } from "pinia"
import { ref } from "vue"
/* ----------------------------- END VUE IMPORTS --------------------------- */

/* ----------------------------- STORE IMPORTS ----------------------------- */
import { useSecureStore } from "./secure"
import { useAppStore } from "./app"
/* -------------------------- END STORE IMPORTS ---------------------------- */

/* --------------------------- PACKAGE IMPORTS ----------------------------- */
/* ------------------------- END PACKAGE IMPORTS --------------------------- */

/* ---------------------------- OTHER IMPORTS ------------------------------ */
import { HTTP_RESPONSE_STATUS, type User } from "./types"
/* -------------------------- END OTHER IMPORTS ---------------------------- */




export const useUserStore = defineStore('user', () => {
  /* --------------------------------- STORES ------------------------------- */
  const appStore = useAppStore()
  const secureStore = useSecureStore()
  /* ------------------------------ END STORES ------------------------------ */

  /* --------------------------------- STATES ------------------------------- */
  const thisUser = ref({} as User)
  const selecteUser = ref({} as User)
  const users = ref([] as User[])
  const friends = ref([] as User[])
  const thisFriend = ref({} as User)
  const selectedFriend = ref({} as User)
  /* ------------------------------ END STATES ------------------------------ */

  /* -------------------------------- COMPUTED ------------------------------ */
  /* ------------------------------ END COMPUTED ---------------------------- */

  /* -------------------------------- WATCHERS ------------------------------ */
  /* ------------------------------ END WATCHERS ---------------------------- */

  /* --------------------------------- METHODS ------------------------------ */
  const getUsers = async (): Promise<User[] | undefined> => {
    try {
      const response = await appStore.handleApiRequest(appStore.api.get(`v1/users`))

      if ('error' in response) {
        console.error(`@___ Error on retrieving user :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Retrieved user successfully ::`, response.data)
      return response.data as User[]
    } catch (error) {
      console.error(`@___ Unexpected error on retrieving user :: ${error}`)
      return undefined
    }
  }

  const getUser = async (payload: User): Promise<User | undefined> => {
    // Check locally for the user first
    let user = users.value.find((_user) => _user.uuid === payload.uuid)

    // If not found locally, attempt to fetch from the server
    if (!user) {
      user = await getUserByUuid(payload)
      if (!user) {
        console.error(`@___ User not found with uuid: ${payload.uuid}`)
      }
    }

    return user
  }

  const getUserByUuid = async (payload: User): Promise<User | undefined> => {
    const { uuid } = payload

    if (!uuid) {
      console.error('@___ Missing uuid in payload')
      return undefined
    }

    try {
      const response = await appStore.handleApiRequest(appStore.api.get(`v1/users/${uuid}`))

      if ('error' in response) {
        console.error(`@___ Error on retrieving user :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Retrieved user successfully ::`, response.data)
      return response.data as User
    } catch (error) {
      console.error(`@___ Unexpected error on retrieving user :: ${error}`)
      return undefined
    }
  }

  const loginUser = async (username: string, password: string): Promise<User | undefined> => {
    if (!username || !password) {
      console.error('@___ Missing username or password')
      return undefined
    }

    try {
      const response = await appStore.handleApiRequest(appStore.api.post(`auth/login`, { username, password }))

      if ('error' in response) {
        console.error(`@___ Error on retrieving user :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Retrieved user successfully ::`, response.data)
      return response.data.user as User
    } catch (error) {
      console.error(`@___ Unexpected error on retrieving user :: ${error}`)
      return undefined
    }
  }

  const addUser = async (payload: User): Promise<User | undefined> => {
    try {
      payload.password = await secureStore.hashPassword(payload.password)
      const response = await appStore.handleApiRequest(appStore.api.post(`v1/users`, payload))

      if ('error' in response) {
        console.error(`@___ Error on adding user :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Added user successfully ::`, response.data)
      return response.data as User
    } catch (error) {
      console.error(`@___ Unexpected error on adding user :: ${error}`)
      return undefined
    }
  }

  const registerUser = async (payload: User): Promise<User | undefined> => {
    try {
      // payload.password = await secureStore.hashPassword(payload.password)
      const response = await appStore.handleApiRequest(appStore.api.post(`auth/register`, payload))

      if ('error' in response) {
        console.error(`@___ Error on adding user :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Added user successfully ::`, response.data)
      return response.data as User
    } catch (error) {
      console.error(`@___ Unexpected error on adding user :: ${error}`)
      return undefined
    }
  }

  const updateUser = async (payload: User): Promise<User | undefined> => {
    const _user = users.value.find((user) => user.uuid === payload.uuid)
    if (!_user) {
      console.error(`@___ User not found with uuid: ${payload.uuid}`)
      return undefined
    }

    try {
      if ('password' in payload) {
        payload.password = await secureStore.hashPassword(payload.password)
      }

      const response = await appStore.handleApiRequest(appStore.api.put(`v1/users/${_user.uuid}`, payload))
      if ('error' in response) {
        console.error(`@___ Error on updating user :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Updated user successfully ::`, response.data)
      return response.data as User
    } catch (error) {
      console.error(`@___ Unexpected error on updating user :: ${error}`)
      return undefined
    }
  }

  const saveUser = async (payload: User): Promise<User | undefined> => {
    return payload.uuid ? await updateUser(payload) : await addUser(payload)
  }

  const deleteUser = async (payload: User) => {
    const _user = users.value.find((user) => user.uuid === payload.uuid)
    if (!_user) {
      console.error(`@___ User not found with uuid: ${payload.uuid}`)
      return undefined
    }

    try {
      const response = await appStore.handleApiRequest(appStore.api.delete(`v1/users/${payload.uuid}`))
      if ('error' in response) {
        console.error(`@___ Error on deleting user :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Deleted user successfully ::`, response.data)
      return response.data as User
    } catch (error) {
      console.error(`@___ Unexpected error on updating user :: ${error}`)
      return undefined
    }
  }







  /* ------------------------------ END METHODS ----------------------------- */









  return {
    thisUser,
    selecteUser,
    users,
    getUsers,
    getUser,
    getUserByUuid,
    addUser,
    updateUser,
    saveUser,
    deleteUser,
    loginUser,
    registerUser
  }
})