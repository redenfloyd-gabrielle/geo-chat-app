<template>
  <div class="map-container">
    <Loading :is-show="mapStore.isLoading" @click-cancel-btn="mapStore.isLoading = false" />

    <!-- <div class="top-header">
      <button class="btn btn-primary" @click="appStore.messagesBtnClick"> Messages </button>
      <span>{{ mapStore.weather + '&nbsp' + mapStore.location }}</span>
    </div> -->
    <div :class="mapStore.isLoading ? 'loading-screen loading' : ''">
      <div id="map"></div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeMount, onMounted, onUnmounted, onUpdated, ref } from 'vue';
  import { useMapStore } from '../stores/map';
  import Loading from './Loading.vue';
  import { useAppStore } from '../stores/app';
  import { useLocationStore } from '../stores/location';
  const mapStore = useMapStore();
  const appStore = useAppStore()
  const locationStore = useLocationStore()

  onMounted(async () => {
    mapStore.mapInstance('map')
   await locationStore.getLocationsByChannel()
    // mapStore._generateFakeData(10)
  })
  onUpdated(async() =>{
    // mapStore.mapInstance('map')
  //  key.value +=1
    await locationStore.getLocationsByChannel()
  })

  onUnmounted(async() =>{
    await locationStore.getLocationsByChannel()
  })
</script>

<style scoped></style>