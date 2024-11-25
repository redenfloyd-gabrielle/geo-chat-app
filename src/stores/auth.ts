/* ------------------------------- VUE IMPORTS ----------------------------- */
import { defineStore } from "pinia"
/* ----------------------------- END VUE IMPORTS --------------------------- */

/* ----------------------------- STORE IMPORTS ----------------------------- */
import { useAppStore } from "./app"
/* -------------------------- END STORE IMPORTS ---------------------------- */

/* --------------------------- PACKAGE IMPORTS ----------------------------- */
/* ------------------------- END PACKAGE IMPORTS --------------------------- */

/* ---------------------------- OTHER IMPORTS ------------------------------ */
import { HTTP_RESPONSE_STATUS, type TokenResponse, type User } from "./types"
/* -------------------------- END OTHER IMPORTS ---------------------------- */




export const useAuthStore = defineStore('auth', () => {
  /* --------------------------------- STORES ------------------------------- */
  const appStore = useAppStore()
  /* ------------------------------ END STORES ------------------------------ */

  /* --------------------------------- STATES ------------------------------- */
  /* ------------------------------ END STATES ------------------------------ */

  /* -------------------------------- COMPUTED ------------------------------ */
  /* ------------------------------ END COMPUTED ---------------------------- */

  /* -------------------------------- WATCHERS ------------------------------ */
  /* ------------------------------ END WATCHERS ---------------------------- */

  /* --------------------------------- METHODS ------------------------------ */
  const login = async (username: string, password: string) => {
    try {
      const response = await appStore.handleApiRequest(appStore.api.post(`auth/login`, { username, password }))

      if ('error' in response) {
        console.error(`@___ Error on login user ::`, response)
        return response
      }

      console.log(`@___ handleApiRequest response ::`, response)
      return response.data as User
    } catch (error) {
      console.error(`@___ Unexpected error on login user :: ${error}`)
      return undefined
    }
  }

  const validateToken = async () => {
    try {
      const response = await appStore.handleApiRequest(appStore.api.get(`auth/validate_token`))

      if ('error' in response) {
        console.error(`@___ Error on validating user's token :: ${response}`)
        return response
      }
      console.log(`@___ Token is still valid ::`, response.data)
      return response.data as TokenResponse
    } catch (error) {
      console.error(`@___ Unexpected error on login user :: ${error}`)
      return undefined
    }
  }

  const renewToken = async () => {
    try {
      const response = await appStore.handleApiRequest(appStore.api.get(`auth/renew-token`))

      if ('error' in response) {
        console.error(`@___ Error on validating user's token :: ${response}`)
        return response
      }
      // console.log(`@___ Token is still valid ::`, response.message)
      return response.data.token as string
    } catch (error) {
      console.error(`@___ Unexpected error on login user :: ${error}`)
      return undefined
    }
  }


  /* ------------------------------ END METHODS ----------------------------- */

  return {
    login,
    validateToken,
    renewToken
  }
})