import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { fa, faker } from '@faker-js/faker';
import { useAppStore } from './app';
import { useRouter } from 'vue-router';

export const useMapStore = defineStore('mapStore', () => {

  const appStore = useAppStore()
  //
  const thisCoordinates = ref<[number, number]>([10.31672, 123.89071]);
  const coordinates = ref<Array<[number, number]>>([]);
  const zoom = ref(17);
  const map = ref<L.Map | null>(null);
  const isLoading = ref(false)
  const weather = ref('')
  const location = ref('')
  const routingControl = ref();
  const router = useRouter()

  const mapInstance = computed(() => (mapId?: string) => {
    if (mapId) {
      map.value = L.map(mapId).setView(thisCoordinates.value, 13);
    }


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map.value as L.Map);

    const sendLocatonControl = L.Control.extend({
      onAdd: function () {
        const button = L.DomUtil.create('button', 'send-location-btn');
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
  });

  watch(() => thisCoordinates.value, (newValue, oldValue) => {

    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {

      map.value?.setView(newValue, zoom.value);

      const avatar = L.icon({
        iconUrl: faker.image.avatar(),
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -50],
        className: 'map-avatar'
      });

      L.marker(newValue, { icon: avatar }).addTo(map.value as L.Map)
        .bindPopup(weather.value + '<br>' + location.value + '<br>' + 'Me')
        .openPopup();
    }
  })

  watch(coordinates.value, (newValue) => {
    if (newValue.length > 1) {
      routingControl.value = L.Routing.control({
        waypoints: coordinates.value.map(coord => L.latLng(coord[0], coord[1])),
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
      }).addTo(map.value as L.Map);

      //remove the routing list container 
      const container = routingControl.value.getContainer()
      const parentNode = container.parentNode
      parentNode.removeChild(container)
    }
  });



  watch(isLoading, async (value) => {
    if (value) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      getCoordinates()
    }
  })

  const getCoordinates = () => {
    // console.log("@____centerPoint", coordiantes.value);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {

          const lat = position.coords.latitude;
          const long = position.coords.longitude;

          try {
            weather.value = await getWeather(lat, long)
            location.value = await getLocation(lat, long)
            thisCoordinates.value = [lat, long];
            coordinates.value.push([lat, long])
            isLoading.value = false;

            console.error("No data available");

          } catch (error) {
            console.error("Error fetching data:", error);
          }
        },
        (err) => {
          console.log("Unable to retrieve your location. Error:", err.message);
        }
      )
    }
  }

  const getWeather = async (lat: number, long: number) => {
    const weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current_weather=true`;
    try {
      return await fetch(weatherAPI).then(async (response) => {
        const weather = await response.json()
        if (weather) {
          return weather.current_weather.temperature + weather.current_weather_units.temperature
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

      const lat = faker.number.float({
        min: latitudeRange.min,
        max: latitudeRange.max,
      });

      const long = faker.number.float({
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

      const weather = await getWeather(lat, long)
      const location = await getLocation(lat, long)

      L.marker([lat, long], { icon: avatar }).addTo(map.value as L.Map)
        .bindPopup(weather + '<br>' + location + '<br>' + appStore.friends[i].fullname)
      coordinates.value.push([lat, long])
    }
  }


  return {
    coordinates,
    zoom,
    mapInstance,
    isLoading,
    weather,
    location,
    getLocation,
    _generateFakeData,
  };
});
