<template>
  <div class="map-container">
    <Loading :is-show="mapStore.isLoading" @click-cancel-btn="mapStore.isLoading = false" />
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

  onMounted(async() => {
    mapStore.mapInstance('map')
    await locationStore.getLocationsByChannel()
  })

  onUnmounted(async() =>{
    mapStore.mapInstance('map')
  })
</script>

<style scoped></style>