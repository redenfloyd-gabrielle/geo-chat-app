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
import { HTTP_RESPONSE_STATUS, type Location } from "./types"
/* -------------------------- END OTHER IMPORTS ---------------------------- */




export const useLocationStore = defineStore('location', () => {
  /* --------------------------------- STORES ------------------------------- */
  const appStore = useAppStore()
  /* ------------------------------ END STORES ------------------------------ */

  /* --------------------------------- STATES ------------------------------- */
  const locations = ref([] as Location[])
  const thisLocation = ref({} as Location)
  const selectedLocation = ref({} as Location)
  /* ------------------------------ END STATES ------------------------------ */

  /* -------------------------------- COMPUTED ------------------------------ */
  /* ------------------------------ END COMPUTED ---------------------------- */

  /* -------------------------------- WATCHERS ------------------------------ */
  /* ------------------------------ END WATCHERS ---------------------------- */

  /* --------------------------------- METHODS ------------------------------ */
  const getLocations = async (): Promise<Location[] | undefined> => {
    try {
      const response = await appStore.handleApiRequest(appStore.api.get(`locations`))

      if ('error' in response) {
        console.error(`@___ Error on retrieving locations :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Retrieved locations successfully ::`, response.data)
      return response.data as Location[]
    } catch (error) {
      console.error(`@___ Unexpected error on retrieving locations :: ${error}`)
      return undefined
    }
  }

  const getLocation = async (payload: Location): Promise<Location | undefined> => {
    // Check locally for the location first
    let location = locations.value.find((_location) => _location.uuid === payload.uuid)

    // If not found locally, attempt to fetch from the server
    if (!location) {
      location = await getLocationByUuid(payload)
      if (!location) {
        console.error(`@___ Location not found with uuid: ${payload.uuid}`)
      }
    }

    return location
  }

  const getLocationByUuid = async (payload: Location): Promise<Location | undefined> => {
    const { uuid } = payload

    if (!uuid) {
      console.error('@___ Missing uuid in payload')
      return undefined
    }

    try {
      const response = await appStore.handleApiRequest(appStore.api.get(`locations/${uuid}`))

      if ('error' in response) {
        console.error(`@___ Error on retrieving location :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Retrieved location successfully ::`, response.data)
      return response.data as Location
    } catch (error) {
      console.error(`@___ Unexpected error on retrieving location :: ${error}`)
      return undefined
    }
  }

  const addLocation = async (payload: Location): Promise<Location | undefined> => {
    try {
      const response = await appStore.handleApiRequest(appStore.api.post(`locations`, payload))

      if ('error' in response) {
        console.error(`@___ Error on adding location :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Added location successfully ::`, response.data)
      return response.data as Location
    } catch (error) {
      console.error(`@___ Unexpected error on adding location :: ${error}`)
      return undefined
    }
  }

  const updateLocation = async (payload: Location): Promise<Location | undefined> => {
    const _location = locations.value.find((location) => location.uuid === payload.uuid)
    if (!_location) {
      console.error(`@___ Location not found with uuid: ${payload.uuid}`)
      return undefined
    }

    try {
      const response = await appStore.handleApiRequest(appStore.api.put(`locations/${_location.uuid}`, payload))
      if ('error' in response) {
        console.error(`@___ Error on updating location :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Updated location successfully ::`, response.data)
      return response.data as Location
    } catch (error) {
      console.error(`@___ Unexpected error on updating location :: ${error}`)
      return undefined
    }
  }

  const saveLocation = async (payload: Location): Promise<Location | undefined> => {
    return payload.uuid ? await updateLocation(payload) : await addLocation(payload)
  }

  const deleteLocation = async (payload: Location) => {
    const _location = locations.value.find((location) => location.uuid === payload.uuid)
    if (!_location) {
      console.error(`@___ Location not found with uuid: ${payload.uuid}`)
      return undefined
    }

    try {
      const response = await appStore.handleApiRequest(appStore.api.delete(`locations/${payload.uuid}`))
      if ('error' in response) {
        console.error(`@___ Error on deleting location :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Deleted location successfully ::`, response.data)
      return response.data as Location
    } catch (error) {
      console.error(`@___ Unexpected error on updating location :: ${error}`)
      return undefined
    }
  }
  /* ------------------------------ END METHODS ----------------------------- */

  return {
    locations,
    thisLocation,
    selectedLocation,
    getLocations,
    getLocation,
    getLocationByUuid,
    addLocation,
    updateLocation,
    saveLocation,
    deleteLocation,
  }
})