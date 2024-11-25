import { defineStore } from 'pinia';
import { computed, nextTick, ref, watch, watchEffect } from 'vue';
import L, { Layer } from 'leaflet';
import 'leaflet-routing-machine';
import { fa, faker, fakerAF_ZA } from '@faker-js/faker';
import { useAppStore } from './app';
import { useLocationStore } from './location';
import { useChannelStore } from './channel';
import { useUserStore } from './user';
import type { Coordinates, Location } from './types';
import { useRouter } from 'vue-router';

export const useMapStore = defineStore('map', () => {
  const userStore = useUserStore()
  const appStore = useAppStore()
  const channelStore = useChannelStore()
  const locationStore = useLocationStore()
  //
  const thisCoordinates = ref<Coordinates>({latitude:10.31672, longitude:123.89071})
  const coordinates = ref([] as Coordinates[]) // <<Coordinates>>([]);
  const zoom = ref(15);
  const map = ref<L.Map | null>(null);
  const isLoading = ref(false)
  const weather = ref('')
  const location = ref('')
  const routingControl = ref();
  const router = useRouter()

  const mapInstance = computed(() => (mapId?: string) => {
    if (mapId && !map.value) {
      const { latitude, longitude } = thisCoordinates.value
      map.value = L.map(mapId).setView([latitude, longitude], zoom.value);
    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map.value as L.Map);

    const sendLocatonControl = L.Control.extend({
      onAdd: function () {
        const button = L.DomUtil.create('button', 'primary-btn');
        button.innerHTML = 'SEND LOCATION';
        button.onclick = async () => {
          isLoading.value = true
        };
        return button;
      }
    });

    const goBackControl = L.Control.extend({
      onAdd: function () {
        const button = L.DomUtil.create('button', 'new-action-btn');
        button.innerHTML = 'Go Back';
        button.onclick = async () => {
          router.push({ name: 'chat', params: { uuid: appStore.selectedChannel.uuid } })
        };
        return button;
      }
    });

      new sendLocatonControl({ position: 'topright' }).addTo(map.value as L.Map);
      new goBackControl({ position: 'topright' }).addTo(map.value as L.Map);
    }
  })

  watch(() => thisCoordinates.value, async(newValue, oldValue) => {
    const { latitude, longitude } = newValue
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {

      map.value?.setView([latitude, longitude], zoom.value)
    }
  })

  watch(coordinates, (newValue, oldValue) => {
    if (newValue.length > 0 && JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
      console.log("newval",newValue,"oldvale",oldValue)
      if(!map.value) return
      
      map.value.eachLayer(layer => {
        if (layer instanceof L.Marker){
          map.value?.removeLayer(layer)
        }
      })
      
      if (routingControl.value) {
        map.value.removeControl(routingControl.value)
        routingControl.value = null
      }

      for(const coord of coordinates.value){
        if(coord.user_uuid === userStore.thisUser.uuid){
          thisCoordinates.value = coord
        }
        
        const avatar = L.icon({
          iconUrl: faker.image.avatar(),
          iconSize: [50, 50],
          iconAnchor: [25, 50],
          popupAnchor: [0, -50],
          className: 'map-avatar'
        });

        map.value.eachLayer(layer => {
          if (layer instanceof L.Marker){
            map.value?.removeLayer(layer)
          }
        })
        map.value?.setView([coord.latitude, coord.longitude], zoom.value)
        const marker  = L.marker([coord.latitude, coord.longitude], { icon: avatar, zIndexOffset:1000 })

         new Promise((resolve) => setTimeout(resolve, 500)).then(async () =>{
          const weather = await getWeather(coord.latitude,  coord.longitude)
          const location = await getLocation(coord.latitude,  coord.longitude)
          marker
          .bindPopup(weather + '<br>' + location + '<br>' ).addTo(map.value as L.Map)
          .addTo(map.value as L.Map)
         })

      }
     
      routingControl.value = L.Routing.control({
        waypoints: coordinates.value.map(coord => L.latLng(coord.latitude, coord.longitude)),
        // routeWhileDragging: false,
        // createMarker: () => { return null; },
        fitSelectedRoutes: true,
        // showAlternatives: false,
        // altLineOptions: { // Styling for alternative routes
        //   styles: [{ color: '#00FF00', opacity: 1, weight: 5,}],
        //   extendToWaypoints: false, 
        //   missingRouteTolerance: 0
        // },
        lineOptions: { // Styling for the main route
          styles: [{ color: '#FF0000', opacity: 1, weight: 3 }],
          extendToWaypoints: false,
          missingRouteTolerance: 0
        },
        // draggableWaypoints: true,
        // animate: true,
        // animationDuration: 1000,
      })
      .addTo(map.value as L.Map);

      //remove the routing list container 
      const container = routingControl.value.getContainer()
      const parentNode = container.parentNode
      parentNode.removeChild(container)
    }
  },{
  immediate: true,
   deep: true
  })

  watch(isLoading, async (value) => {
    if (value) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      thisCoordinates.value.user_uuid ?  removeMyLocation() :  sendLocation() 
    }
  })

  const sendLocation = () => {
    // console.log("@____centerPoint", coordiantes.value);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log(position)
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          try {

            weather.value = await getWeather(latitude, longitude)
            location.value = await getLocation(latitude, longitude)
            
            const payload: Location = {
              channel_uuid: appStore.thisChannel.uuid,
              user_uuid: userStore.thisUser.uuid,
              latitude: latitude,
              longitude: longitude,
              weather: weather.value,
            }
            await locationStore.addLocation(payload).then((response) =>{
              console.log("@___response", response)
              thisCoordinates.value = {user_uuid: userStore.thisUser.uuid, latitude:latitude, longitude: longitude}
              coordinates.value = [{user_uuid: userStore.thisUser.uuid, latitude:latitude, longitude: longitude}, ...coordinates.value];
              // coordinates.value.push({user_uuid: userStore.thisUser.uuid, latitude:latitude, longitude: longitude})
              isLoading.value = false
            })

          } catch (error) {
            console.error("Error fetching data:", error)
          }
        },
        (err) => {
          console.log("Unable to retrieve your location. Error:", err.message)
        }
      )
    }
  }

  const removeMyLocation = async() =>{
    const idx = coordinates.value.findIndex(coord => coord.user_uuid === userStore.thisUser.uuid)
    if(idx  != -1){
      const myLocation = locationStore.locations.find(location => location.user_uuid == userStore.thisUser.uuid) as Location
      await locationStore.deleteLocation(myLocation).then(async () =>{
        isLoading.value = false
        thisCoordinates.value = {latitude:10.31672, longitude: 123.89071}
        coordinates.value = [...coordinates.value.slice(0, idx), ...coordinates.value.slice(idx + 1)];
      })
    }
  }

  const getWeather = async (lat: number, long: number) => {
    const weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current_weather=true`;
    try {
      return await fetch(weatherAPI).then(async (response) => {
        const weather = await response.json()
        if (weather) {
          const weatherCondition = weather.current_weather.weathercode;
          let condition:any;
          switch (weatherCondition) {
            case 0:
              condition = 'Clear sky';
              break;
            case 1:
            case 2:
              condition = 'Partly cloudy';
              break;
            case 3:
              condition = 'Cloudy';
              break;
            case 45:
            case 48:
              condition = 'Fog';
              break;
            case 51:
            case 53:
            case 55:
              condition = 'Drizzle';
              break;
            case 61:
            case 63:
            case 65:
              condition = 'Rain';
              break;
            case 66:
            case 67:
              condition = 'Freezing rain';
              break;
            case 71:
            case 73:
            case 75:
              condition = 'Snow';
              break;
            case 80:
            case 81:
            case 82:
              condition = 'Heavy rain showers';
              break;
            case 85:
            case 86:
              condition = 'Heavy snow showers';
              break;
            case 95:
            case 96:
            case 99:
              condition = 'Thunderstorm';
              break;
            default:
              condition = 'Unknown';
          }
          return weather.current_weather.temperature + weather.current_weather_units.temperature + condition
        }
      });
    } catch (error) {
      console.error(error)
    }
  }

  const getLocation = async (lat: number, long: number) => {
    const locationAPI = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`;
    try {
      return await fetch(locationAPI).then(async (response) => {
        const location = await response.json()
        if (location) {
          return location.display_name
        }
      });
    }
    catch (error) {
      console.error(error)
    }
  }


  const _generateFakeData = async (length: number) => {

    coordinates.value.splice(0, length); //for faker only remove first 10 items
    for (let i = 0; i < length; i++) {
      //cebu city coordinates 
      const latitudeRange = { min: 10.2599, max: 10.4076 };
      const longitudeRange = { min: 123.8252, max: 124.0306 };

      const latitude = faker.number.float({
        min: latitudeRange.min,
        max: latitudeRange.max,
      });

      const longitude = faker.number.float({
        min: longitudeRange.min,
        max: longitudeRange.max,
      });

      const avatar = L.icon({
        iconUrl: faker.image.avatar(),
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -50],
        className: 'map-avatar'
      });

      const weather = await getWeather(latitude, longitude)
      const location = await getLocation(latitude, longitude)

      L.marker([latitude, longitude], { icon: avatar }).addTo(map.value as L.Map)
        .bindPopup(weather + '<br>' + location + '<br>' )
      coordinates.value.push( {latitude:latitude, longitude:longitude})
    }
  }


  const setCoordinates = async(payload:Coordinates[]) =>{
    coordinates.value = payload.map(({ user_uuid, latitude, longitude }) => ({
      user_uuid,
      latitude,
      longitude
    })) as Coordinates[]

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
    map,
    getLocation,
    _generateFakeData,
    setCoordinates
  };
});
