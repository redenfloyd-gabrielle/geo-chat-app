import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { faker } from '@faker-js/faker';

export const useMapStore = defineStore('mapStore', () => {
  //
  const coordinates = ref<[number, number]>([10.31672, 123.89071]);
  const zoom = ref(17);  
  const map = ref<L.Map | null>(null);
  const isLoading = ref(false)
  const weather = ref('')
  const location = ref('')

  const mapInstance = computed(() => (mapId: string) => {
    if (!map.value) {
      map.value = L.map(mapId).setView(coordinates.value, 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map.value as L.Map);
  
      L.control.zoom({
        position: 'topright' 
      }).addTo(map.value as L.Map);
  

      const sendLocatonControl = L.Control.extend({
        onAdd: function () {
          const button = L.DomUtil.create('button', 'send-location-btn');
          button.innerHTML = 'SEND LOCATION'; 
          button.onclick = async() => {
           isLoading.value = true
          };
          return button;
        }
      });
      new sendLocatonControl({ position: 'topright' }).addTo(map.value as L.Map);
    }
  });

  watch(() => coordinates.value, (newValue, oldValue) => {

    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)){

      map.value?.setView(newValue, zoom.value); 
       
      const avatar = L.icon({
        iconUrl: faker.image.avatar(), 
        iconSize: [50, 50],
        iconAnchor: [25, 50], 
        popupAnchor: [0, -50],
        className: 'map-avatar'
      });

      L.marker(newValue, {icon: avatar}).addTo(map.value as L.Map)
       .bindPopup(weather.value + '<br>' + location.value)
       .openPopup();
    }
  })

  watch(isLoading, async (value)=>{
    if(value){
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
              coordinates.value = [lat, long];
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

  const getWeather = async(lat, long) =>{
    const weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current_weather=true`;
    try{
      return await fetch(weatherAPI).then(async (response) =>{
        const weather = await response.json()
        if(weather){
          return weather.current_weather.temperature + weather.current_weather_units.temperature
        }
       });
    } catch(error){
       console.error(error)
    }
  } 

  const getLocation = async(lat, long) =>{
    const locationAPI = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`;
    try{
     return await fetch(locationAPI).then(async(response) =>{
      const location = await response.json()
      if(location){
          return location.display_name
      }
      });
    }
    catch(error){
      console.error(error)
    }
  } 


  const GenerateFakeData = async (length: number) =>{

    for( let i = 0; i < length; i++){
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

      L.marker([lat,long], {icon: avatar}).addTo(map.value as L.Map)
       .bindPopup(weather + '<br>' + location)
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
    GenerateFakeData
  };
});
