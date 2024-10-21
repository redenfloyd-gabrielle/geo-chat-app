<template>
  <div class="map-container">
    <Loading :is-show="mapStore.isLoading" />

    <div class="top-header">
      <button class="btn btn-primary" @click="appStore.messagesBtnClick"> Messages </button>
      <span>{{ mapStore.weather + '&nbsp' + mapStore.location }}</span>
    </div>
    <div :class="mapStore.isLoading ? 'loading-screen loading' : ''">
      <div id="map"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useMapStore } from '../stores/map';
  import Loading from './Loading.vue';
  import { useAppStore } from '../stores/app';

  const mapStore = useMapStore();
  const appStore = useAppStore()

  onMounted(async () => {
    mapStore.mapInstance('map')
    await mapStore.GenerateFakeData(10)
  });

</script>

<style scoped></style>