import { defineStore } from 'pinia'
import { computed, nextTick, ref, watch, watchEffect } from 'vue'
import L, { bind, icon, Layer, Marker } from 'leaflet'
import 'leaflet-routing-machine'
import { fa, faker, fakerAF_ZA, ja } from '@faker-js/faker'
import { useAppStore } from './app'
import { useLocationStore } from './location'
import { useChannelStore } from './channel'
import { useUserStore } from './user'
import { LOCATION_PERMISSION, WS_EVENT, type _Marker, type Coordinates, type Coords, type Location, type LocationRoute, type WebsocketMessage } from './types'
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
  const isWatchLocation = ref(false)
  const routingList = ref([])
  const position = ref();
  const error = ref();
  const locationRoutes = ref([] as LocationRoute[])

  let sendLocationButtonElement: HTMLButtonElement | null = null

  const isMe = computed(() => coordinates.value.some(coords => coords.user_uuid === appStore.user.uuid))
  const isMarkerLoading = computed(() => coordinates.value.length !== markers.value.length)
  const sendLocationButtonLabel = computed(() => isMe.value ? "REMOVE LOCATION" : "SEND LOCATION")
  const isCoordinateMoving = computed(() => isMe.value ? true : false)
  const coordsWatchId = ref()

  let index = 0;
  const _coordinates = [
    { latitude: 10.2508389, longitude: 123.8633616 },
    { latitude: 10.250941, longitude: 123.862953 },
    { latitude: 10.251286, longitude: 123.862850 },
    { latitude: 10.250787, longitude: 123.860441 },
    { latitude: 10.250317, longitude: 123.858349 },
    { latitude: 10.250186, longitude: 123.857156 },
    { latitude: 10.251000, longitude: 123.860357 },
    { latitude: 10.251373, longitude: 123.860234 },
    { latitude: 10.251644, longitude: 123.860332 },
    { latitude: 10.251935, longitude: 123.860422 },
    { latitude: 10.252222, longitude: 123.860555 },
    { latitude: 10.252610, longitude: 123.860704 },
    { latitude: 10.253099, longitude: 123.860893 },
    { latitude: 10.253604, longitude: 123.861088 },
    { latitude: 10.254163, longitude: 123.862530 },
    { latitude: 10.254452, longitude: 123.862896 },
    { latitude: 10.254617, longitude: 123.863077 },
    { latitude: 10.254831, longitude: 123.863359 },
    { latitude: 10.255095, longitude: 123.863640 },
    { latitude: 10.255251, longitude: 123.863812 },
    { latitude: 10.255559, longitude: 123.864166 },
    { latitude: 10.255778, longitude: 123.864598 },
    { latitude: 10.255939, longitude: 123.864924 },
    { latitude: 10.255750, longitude: 123.864576 },
    { latitude: 10.255179, longitude: 123.863775 },
    { latitude: 10.254905, longitude: 123.863467 },
    { latitude: 10.254579, longitude: 123.863044 },
    { latitude: 10.254284, longitude: 123.862669 },
    { latitude: 10.253890, longitude: 123.862106 },
    { latitude: 10.253752, longitude: 123.861876 },
    { latitude: 10.253674, longitude: 123.861442 },
    { latitude: 10.253622, longitude: 123.861063 },
    { latitude: 10.253815, longitude: 123.860949 },
    { latitude: 10.254077, longitude: 123.860860 },
    { latitude: 10.254650, longitude: 123.860726 },
    { latitude: 10.255517, longitude: 123.860477 },
    { latitude: 10.255974, longitude: 123.860332 },
    { latitude: 10.256545, longitude: 123.860202 },
    { latitude: 10.257115, longitude: 123.860064 },
    { latitude: 10.257436, longitude: 123.860390 },
    { latitude: 10.258060, longitude: 123.860893 },
    { latitude: 10.258518, longitude: 123.861397 },
    { latitude: 10.258977, longitude: 123.862198 },
    { latitude: 10.259032, longitude: 123.863615 },
    { latitude: 10.258885, longitude: 123.864379 },
    { latitude: 10.258390, longitude: 123.865330 },
    { latitude: 10.258078, longitude: 123.865964 }
  ];

  watchEffect(() => {
    if (!navigator.geolocation) return
    if (!isCoordinateMoving.value) return
    // const intervalId = setInterval(updateCoordinates, 2000); // Run every 2 seconds
    // Run every 2 seconds 

    coordsWatchId.value = navigator.geolocation.watchPosition(
      async coordinates => {
        console.log("WATCH COORDS", coordinates)
        const { latitude, longitude } = coordinates.coords

        const payload: Location = {
          uuid: locationStore.locations.find(location => location.user_uuid == appStore.user.uuid)?.uuid,
          channel_uuid: appStore.thisChannel.uuid,
          user_uuid: appStore.user.uuid,
          latitude: latitude,
          longitude: longitude,
          weather: weather.value,
        }

        await locationStore.updateLocation(payload).then((response) => {
          if (response) {
            thisCoordinates.value = { uuid: payload.uuid, user_uuid: appStore.user.uuid, channel_uuid: appStore.thisChannel.uuid, latitude: latitude, longitude: longitude }
            isLoading.value = false
            console.log("SUCCESSFULLY UPDATED")
          }
        })
      }, _error => {
        error.value = _error
      }, {
      maximumAge: 0,
      enableHighAccuracy: true,
    })

    // setInterval( () =>{
    //   navigator.geolocation.getCurrentPosition(coordinates =>{
    //     console.log("set time interval",coordinates.coords.latitude, coordinates.coords.longitude)
    //   })
    //   console.log("count")

    // }, 3000)
  })

  // const updateCoordinates = async () => {
  //   if (index < _coordinates.length) {
  //     const { latitude, longitude } = _coordinates[index];
  //     console.log(`(${latitude}, ${longitude})`);

  //     const payload: Location = {
  //       uuid: locationStore.locations.find(location =>location.user_uuid == appStore.user.uuid)?.uuid,
  //       channel_uuid: appStore.thisChannel.uuid,
  //       user_uuid: appStore.user.uuid,
  //       latitude: latitude,
  //       longitude: longitude,
  //       weather: weather.value,
  //     }

  //     await locationStore.updateLocation(payload).then((response) => {
  //       if (response) {
  //         thisCoordinates.value = {uuid: payload.uuid, user_uuid: appStore.user.uuid, channel_uuid: appStore.thisChannel.uuid, latitude: latitude, longitude: longitude }
  //         isWatchLocation.value = true
  //         isLoading.value = false
  //         console.log("SUCCESSFULLY UPDATED")
  //       }
  //     })
  //     index++;
  //   } else {
  //     // clearInterval(intervalId); // Stop the interval once all coordinates are used
  //   }
  // };

  watch(position.value, (value) => {
    // console.log("WATCH COORDS", value)
  })

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
          router.push({ name: 'chat', params: { chat_uuid: appStore.selectedChannel.uuid } })
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
    console.log("markers")
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
    console.log("coordinates")
    coordinates.filter(coordinate => !markers.value.some(mark => mark.user_uuid === coordinate.user_uuid)).map((coordinate) => {

      const avatar = L.divIcon({
        className: 'custom-div-icon',
        html:
          `<div class='marker-pin-green'> 
        <img class="pin-avatar" src="${coordinate.user_uuid === appStore.user.uuid ? appStore.user.image_url : appStore.getUserImage(coordinate.user_uuid as string)}" alt="Avatar">   
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
      marker.user_uuid === appStore.user.uuid ? "Me" : appStore.getUserFullname(marker.user_uuid as string) ?? "Stranger",
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
          <img class="p-1 img-avatar" src="${marker.user_uuid === appStore.user.uuid ? appStore.user.image_url : appStore.getUserImage(marker.user_uuid as string)}" alt="Avatar">
          <h1 class="img-avatar-name"> ${content[1]}  </h1>
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
    // if (marker.user_uuid == appStore.user.uuid) marker.marker?.openPopup()
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
        <img class="pin-avatar" src="${marker.user_uuid === appStore.user.uuid ? appStore.user.image_url : appStore.getUserImage(marker.user_uuid as string)}" alt="Avatar">   
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
        }, error => {
          reject(error)
        }, {
        enableHighAccuracy: true,
        maximumAge: 0,
      });
    })
  }

  const sendMyLocation = async () => {

    const { latitude, longitude } = await getCurrentPosition()
    console.log("CURRENT COORDS", latitude, longitude)
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
        thisCoordinates.value = {
          user_uuid: appStore.user.uuid, channel_uuid: appStore.thisChannel.uuid, latitude: latitude, longitude: longitude
        }
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
        navigator.geolocation.clearWatch(coordsWatchId.value)
        coordsWatchId.value = undefined
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

      await locationStore.addLocation(payload).then((response) => {
        if (response) {
          // thisCoordinates.value = { user_uuid: appStore.user.uuid, channel_uuid: appStore.thisChannel.uuid, latitude: latitude, longitude: longitude }
          // isLoading.value = false
        }
      })

      coordinates.value.push({ user_uuid: faker.string.uuid(), latitude: latitude, longitude: longitude } as Coordinates)
    }
  }

  const setCoordinatesState = async (payload: Coordinates[]) => {
    coordinates.value = payload.map(({ uuid, channel_uuid, user_uuid, latitude, longitude }) => ({
      uuid,
      channel_uuid,
      user_uuid,
      latitude,
      longitude
    })) as Coordinates[]
  }

  const synchronizeCoordinates = (payload: Coordinates) => {
    const { latitude, longitude, user_uuid, channel_uuid } = payload

    if (latitude && longitude) {
      if (coordinates.value.some(coords => coords.user_uuid == user_uuid)) {
        const idx = coordinates.value.findIndex(coord => coord.user_uuid === user_uuid)
        coordinates.value.splice(idx, 1)

        const markerIndex = markers.value.findIndex(marker => marker.user_uuid === user_uuid)
        if (markerIndex !== -1) {
          markers.value[markerIndex].marker?.remove()
          markers.value.splice(markerIndex, 1)
        }

        coordinates.value.splice(idx, 1)
      }
      coordinates.value.push(payload as Coordinates)


      // const route = locationRoutes.value.find(route => 
      //   route.user_uuid === user_uuid && route.channel_uuid === channel_uuid
      // ) as LocationRoute | undefined;  // Adjusted to handle 'undefined' if not found

      // if (route) {
      //   route.waypoint.push(L.latLng(latitude, longitude));  // If route is found, push new waypoint
      // } else {
      //   locationRoutes.value.push({
      //     user_uuid: user_uuid,
      //     channel_uuid: channel_uuid,
      //     waypoint: [L.latLng(latitude, longitude)]  // Initialize waypoint array
      //   });
      // }

      // locationRoutes.value// add here the data 

      /*

      locationRoutes expected value should
      exected structure
      user_uuid: 1awdpmesHw23
      //      note: the waypoint is from the payload and  push the latitude, longitude,  to  L.latLng if the user_uuid is equal to the locationRoutes user_uuid
      waypoint: [
          L.latLng(10.2508389, 123.8633616),
          L.latLng(10.250941, 123.862953),
          L.latLng(10.251286, 123.862850)
      ]

      */

      //   const waypointGroups = {
      //     user_uuid: [
      //         L.latLng(10.2508389, 123.8633616),
      //         L.latLng(10.250941, 123.862953),
      //         L.latLng(10.251286, 123.862850),
      //         L.latLng( 10.251171, 123.861844),

      //     ],
      //     B: [
      //         L.latLng(10.280701, 123.881487),
      //         L.latLng(10.283245, 123.884410),           
      //     ]
      // } as any

      // for (const groupKey in waypointGroups) {
      //     if (waypointGroups.hasOwnProperty(groupKey)) {
      //         const _payload = {
      //             channel_uuid: appStore.thisChannel.uuid,
      //             user_uuid: appStore.user.uuid,
      //             waypoint: waypointGroups[groupKey].map((latlng: any) => [latlng.lat, latlng.lng])
      //         } as any;

      //         createRoutingControl(_payload);
      //     }
      // }

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
      router.push({ name: 'map', query: { view: 'map' } })
    })
  }

  const createRoutingControl = (payload: any) => {
    const contorl: any = L.Routing.control({
      waypoints: payload.waypoint,
      routeWhileDragging: false,
      fitSelectedRoutes: false,
      draggableWaypoints: false,

      //   createMarker: function(waypointIndex, waypoint, numberOfWaypoints) {
      //     // Create a custom marker for each waypoint
      //     // if(waypoint.lan[waypoint.latLng.length - 1]) return
      //     // if(waypointIndex == 1) return
      //     if(waypointIndex ===numberOfWaypoints - 1){
      //     console.log("waypoint",waypointIndex,waypoint)
      //     return L.marker(waypoint.latLng, {
      //       icon:L.divIcon({
      //         className: 'custom-div-icon',
      //         html:
      //           `<div class='marker-pin-green'> 
      //           <img class="pin-avatar" src="${ payload.user_uuid === appStore.user.uuid? appStore.user.image_url : appStore.getUserImage(payload.user_uuid as string)}" alt="Avatar">   
      //           </div>  
      //           `,
      //         iconSize: [30, 42],
      //         iconAnchor: [15, 42],
      //         popupAnchor: [0, -35 ],
      //       })
      //     }).bindPopup(`Waypoint ${waypointIndex + 1}`); // Optional: Bind a popup to the marker
      //   }
      // }

    }).addTo(map.value as L.Map);

    const container = contorl.getContainer()
    const parentNode = container.parentNode
    parentNode.removeChild(container)
  };

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
    isWatchLocation,
    locationRoutes,
    coordsWatchId,
    getLocation,
    _generateFakeData,
    setCoordinatesState,
    synchronizeCoordinates,
    checkPermission
  }
})

