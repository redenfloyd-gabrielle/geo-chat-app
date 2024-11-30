import { defineStore } from 'pinia'
import { computed, nextTick, ref, watch, watchEffect } from 'vue'
import L, { bind, icon, Layer, Marker } from 'leaflet'
import 'leaflet-routing-machine'
import { fa, faker, fakerAF_ZA } from '@faker-js/faker'
import { useAppStore } from './app'
import { useLocationStore } from './location'
import { useChannelStore } from './channel'
import { useUserStore } from './user'
import { LOCATION_PERMISSION, WS_EVENT, type _Marker, type Coordinates, type Coords, type Location, type WebsocketMessage } from './types'
import { useRouter } from 'vue-router'
import { useWsStore } from './ws'

export const useMapStore = defineStore('map', () => {
  const userStore = useUserStore()
  const appStore = useAppStore()
  const channelStore = useChannelStore()
  const locationStore = useLocationStore()
  const wsStore = useWsStore()
  //
  const thisCoordinates = ref({} as Coordinates)
  const coordinates = ref([] as Coordinates[]) // <<Coordinates>>([]);
  const zoom = ref(12)
  const map = ref<L.Map | null>(null)
  const isLoading = ref(false)
  // const isMapLoading = ref(false)
  const weather = ref('')
  const location = ref('')
  const routingControl = ref()
  const router = useRouter()
  const markers = ref([] as _Marker[])
  const isMapLoading = ref(false)
  const isLocationInActive = ref(false)

  let sendLocationButtonElement: HTMLButtonElement | null = null


  const isMe = computed(() => coordinates.value.some(coords => coords.user_uuid === appStore.user.uuid))
  const isMarkerLoading = computed(() => coordinates.value.length !== markers.value.length)
  const sendLocationButtonLabel = computed(() => isMe.value ? "REMOVE LOCATION" : "SEND LOCATION")
  const mapInstance = computed(() => (mapId?: string) => {
    if (mapId) {
      map.value = L.map(mapId).setView([10.31672, 123.89071], zoom.value)
      markers.value = [] as _Marker[]
    }

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', }).addTo(map.value as L.Map)

    const sendLocatonControl = L.Control.extend({
      onAdd: () => {
        sendLocationButtonElement = L.DomUtil.create('button', 'primary-btn')
        sendLocationButtonElement.innerHTML = sendLocationButtonLabel.value
        sendLocationButtonElement.onclick = async () => {
          isLoading.value = true
        }
        return sendLocationButtonElement
      },
    })

    const goBackControl = L.Control.extend({
      onAdd: () => {
        const button = L.DomUtil.create('button', 'new-action-btn')
        button.innerHTML = 'Go Back'
        button.onclick = async () => {
          router.push({ name: 'chat', params: { uuid: appStore.selectedChannel.uuid } })
        }
        return button
      }
    })

    new sendLocatonControl({ position: 'topright' }).addTo(map.value as L.Map)
    new goBackControl({ position: 'topright' }).addTo(map.value as L.Map)

  })

  watch(sendLocationButtonLabel, (newLabel) => {
    if (sendLocationButtonElement) {
      sendLocationButtonElement.innerHTML = newLabel
    }
  })

  watch(() => thisCoordinates.value, async (newValue, oldValue) => {

    const { latitude, longitude } = newValue
    console.log("thisCoordinates::", newValue)
    if (latitude && longitude) {
      map.value?.setView([newValue.latitude, newValue.longitude])
    }

    const message = {
      user_uuid: appStore.user.uuid,
      channel_uuid: appStore.thisChannel.uuid,
      ...newValue
    } as Coordinates

    const wsMessage = {
      event: WS_EVENT.COORDINATES,
      data: message
    } as WebsocketMessage
    wsStore.sendMessage(wsMessage)


  }, { deep: true })


  watch(markers, (newMarkers) => {
    newMarkers.forEach((mark) => {
      const { user_uuid, channel_uuid, marker, location, weather } = mark
      const _marker = {
        user_uuid,
        channel_uuid,
        marker,
        location,
        weather,
      } as _Marker

      bindPopup(_marker)
    })
  })

  watch(coordinates, (coordinates) => {
    coordinates.filter(coordinate => !markers.value.some(mark => mark.user_uuid === coordinate.user_uuid)).map((coordinate) => {

      const avatar = L.divIcon({
        className: 'custom-div-icon',
        html:
          `<div class='marker-pin-red'>  
          </div>  
          `,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -35],
      })

      const marker = L.marker([coordinate.latitude, coordinate.longitude],).addTo(map.value as L.Map)
      marker.setIcon(avatar)
      const mark = { user_uuid: coordinate.user_uuid, marker: marker } as _Marker
      markers.value = [mark, ...markers.value]
    })
  }, { deep: true })

  watch(isLoading, (value) => {
    if (value) {
      isMe.value ? removeMyLocation() : sendMyLocation()
    }
  })

  const bindPopup = async (marker: _Marker) => {
    const content = await Promise.all([
      getWeather((marker.marker as any)._latlng.lat, (marker.marker as any)._latlng.lng),
      marker.user_uuid === appStore.user.uuid? "Me" : appStore.getUserFullname(marker.user_uuid as string) ?? "Stranger",
      getLocation((marker.marker as any)._latlng.lat, (marker.marker as any)._latlng.lng)
    ])
    marker.marker?.bindPopup(`
      <div class="tooltip-container">
        <div class="is-flex justify-content-end ">
          <div class="tooltip-weather">
            ${content[0]}
          </div>
        </div>
        <div class="is-flex justify-content-center flex-direction-column align-items-center">
          <img class="p-1 img-avatar" src="${appStore.user.image_url ?? '/get-chat-circle-logo.png'}" alt="Avatar">
          <h1 class="img-avatar-name"> ${content[1]}</h1>
        </div>
        <div>
         <h3>Address</h3>
         </div>   
        <div class="is-flex justify-content-center   align-items-center">
          <span class="tooltip-address">
            ${content[2]}
          </span>
        </div>
      </div>
    `)
    if (marker.user_uuid == appStore.user.uuid) marker.marker?.openPopup()
    // const avatar = L.icon({
    //   iconUrl:  '/src/assets/pin-green1.png',
    //   iconSize: [80, 80],
    //   iconAnchor: [40, 65],
    //   popupAnchor: [0, -50],
    //   className: 'pin'
    // })
    const avatar = L.divIcon({
      className: 'custom-div-icon',
      html:
        `<div class='marker-pin-green'> 
        <img class="pin-avatar" src="${appStore.user.image_url ?? '/get-chat-circle-logo.png'}" alt="Avatar">   
        </div>  
        `,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -35],
    })
    marker.marker?.setIcon(avatar)
  }

  const getCurrentPosition = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve(position.coords)
        },
        error => {
          isLocationInActive.value = true
          reject(error)
          console.error('ERROR::', error)
        }
      )
    })
  }

  const sendMyLocation = async () => {

    const { latitude, longitude } = await getCurrentPosition()

    weather.value = await getWeather(latitude, longitude) as string
    location.value = await getLocation(latitude, longitude) as string

    const payload: Location = {
      channel_uuid: appStore.thisChannel.uuid,
      user_uuid: appStore.user.uuid,
      latitude: latitude,
      longitude: longitude,
      weather: weather.value,
    }

    await locationStore.addLocation(payload).then((response) => {
      if (response) {
        thisCoordinates.value = { user_uuid: appStore.user.uuid, channel_uuid: appStore.thisChannel.uuid, latitude: latitude, longitude: longitude }
        isLoading.value = false
      }
    })
  }

  const removeMyLocation = async () => {
    const idx = coordinates.value.findIndex(coord => coord.user_uuid === appStore.user.uuid)
    if (idx != -1) {
      const myLocation = locationStore.locations.find(location => location.user_uuid == coordinates.value[idx].user_uuid) as Location
      await locationStore.deleteLocation(myLocation).then(async () => {
        map.value?.setView([10.31672, 123.89071])
        thisCoordinates.value = {} as Coordinates

        isLoading.value = false
      })
    }
  }

  const getWeather = async (lat: number, long: number) => {
    const weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current_weather=true`
    try {
      return await fetch(weatherAPI).then(async (response) => {
        const weather = await response.json()
        if (weather) {
          const weatherCondition = weather.current_weather.weathercode
          let condition
          switch (weatherCondition) {
            case 0:
              condition = 'Clear sky'
              break
            case 1:
            case 2:
              condition = 'Partly cloudy'
              break
            case 3:
              condition = 'Cloudy'
              break
            case 45:
            case 48:
              condition = 'Fog'
              break
            case 51:
            case 53:
            case 55:
              condition = 'Drizzle'
              break
            case 61:
            case 63:
            case 65:
              condition = 'Rain'
              break
            case 66:
            case 67:
              condition = 'Freezing rain'
              break
            case 71:
            case 73:
            case 75:
              condition = 'Snow'
              break
            case 80:
            case 81:
            case 82:
              condition = 'Heavy rain showers'
              break
            case 85:
            case 86:
              condition = 'Heavy snow showers'
              break
            case 95:
            case 96:
            case 99:
              condition = 'Thunderstorm'
              break
            default:
              condition = ' Unknown'
          }
          return weather.current_weather.temperature + weather.current_weather_units.temperature + ' ' + condition
        }
      })
    } catch (error) {
      return "Weather not found!"
    }
  }

  const getLocation = async (lat: number, long: number) => {
    const locationAPI = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`
    try {
      return await fetch(locationAPI).then(async (response) => {
        const location = await response.json()
        if (location) {
          return location.display_name
        }
      })
    }
    catch (error) {
      return "Place not found."
    }
  }

  const _generateFakeData = async (length: number) => {
    const waypoints: L.LatLng[] = []
    coordinates.value.splice(0, length) //for faker only remove first 10 items
    for (let i = 0; i < length; i++) {
      //cebu city coordinates 
      const latitudeRange = { min: 10.2599, max: 10.4076 }
      const longitudeRange = { min: 123.8252, max: 124.0306 }

      const latitude = faker.number.float({
        min: latitudeRange.min,
        max: latitudeRange.max,
      })

      const longitude = faker.number.float({
        min: longitudeRange.min,
        max: longitudeRange.max,
      })

      const avatar = L.icon({
        iconUrl: faker.image.avatar(),
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -50],
        className: 'map-avatar'
      })

      const weather = await getWeather(latitude, longitude)
      const location = await getLocation(latitude, longitude)


      const payload: Location = {
        channel_uuid: appStore.thisChannel.uuid,
        user_uuid: faker.string.uuid(),
        latitude: latitude,
        longitude: longitude,
        weather: weather,
      }
      // await locationStore.addLocation(payload).then((response) =>{
      //   console.log("@___response", response)
      //   thisCoordinates.value = {user_uuid: appStore.user.uuid, latitude:latitude, longitude: longitude}
      //   coordinates.value = [{user_uuid: appStore.user.uuid, latitude:latitude, longitude: longitude}, ...coordinates.value];
      //   // coordinates.value.push({user_uuid: appStore.user.uuid, latitude:latitude, longitude: longitude})
      //   isLoading.value = false
      // })
      // map.value?.setView([latitude, longitude], zoom.value)
      // L.marker([latitude, longitude], { icon: avatar }).addTo(map.value as L.Map)
      //   .bindPopup(weather + '<br>' + location + '<br>' )

      coordinates.value.push({ user_uuid: faker.string.uuid(), latitude: latitude, longitude: longitude } as Coordinates)
    }
  }

  const setCoordinatesState = async (payload: Coordinates[]) => {
    coordinates.value = payload.map(({ channel_uuid, user_uuid, latitude, longitude }) => ({
      channel_uuid,
      user_uuid,
      latitude,
      longitude
    })) as Coordinates[]
  }

  const synchronizeCoordinates = (payload: Coordinates) => {
    const { latitude, longitude, user_uuid } = payload

    if (latitude && longitude) {
      coordinates.value.push(payload as Coordinates)
      return
    }

    const idx = coordinates.value.findIndex(coord => coord.user_uuid === user_uuid)
    if (idx === -1) return

    const markerIndex = markers.value.findIndex(marker => marker.user_uuid === user_uuid)
    if (markerIndex !== -1) {
      markers.value[markerIndex].marker?.remove()
      markers.value.splice(markerIndex, 1)
    }

    coordinates.value.splice(idx, 1)
  }

  const checkPermission = async () => {
    isMapLoading.value = true
    await getCurrentPosition().then(() => {
      isMapLoading.value = false
      router.push({ name: 'map' })
    })
  }


  return {
    routingControl,
    thisCoordinates,
    coordinates,
    zoom,
    mapInstance,
    isLoading,
    weather,
    location,
    isMarkerLoading,
    markers,
    sendLocationButtonLabel,
    isLocationInActive,
    isMapLoading,
    getLocation,
    _generateFakeData,
    setCoordinatesState,
    synchronizeCoordinates,
    checkPermission
  }
})
