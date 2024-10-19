<template>
  <Loading :is-show="mapStore.isLoading"/>

  <div class="top-header">
      {{ mapStore.weather +'&nbsp' + mapStore.location }}
  </div>
  <div :class="mapStore.isLoading? 'loading-screen loading':''">
    <div id="map"></div>
  </div> 
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useMapStore } from '../stores/map';  
  import Loading from './Loading.vue';

  const mapStore = useMapStore();

  onMounted( async() => {
    mapStore.mapInstance('map')
    await mapStore.GenerateFakeData(10)
  });
  
</script>

<style scoped></style>