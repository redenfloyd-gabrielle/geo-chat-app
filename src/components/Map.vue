<template>
  <div class="map-container">
    <Modal/>
    <div :class="{'loading-screen':mapStore.isLoading}" id="map"></div>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeMount, onMounted, onUnmounted, onUpdated, ref } from 'vue';
  import { useMapStore } from '../stores/map';

  import { useAppStore } from '../stores/app';
  import { useLocationStore } from '../stores/location';
  import Modal from './Modal.vue';
  const mapStore = useMapStore();
  const appStore = useAppStore()
  const locationStore = useLocationStore()

  onMounted(async() => {
    mapStore.isMapActive = true 
    mapStore.coordsWatchId = undefined
    mapStore.mapInstance('map')
    await locationStore.getLocationsByChannel()
    // mapStore._generateFakeData(20)
  })
  onUnmounted(() =>{
    mapStore.coordsWatchId = undefined
    mapStore.isMapActive = false
  })

</script>

<style scoped></style>