<template lang="">

  <div v-if="mapStore.isLoading" class="card p-1">
    <div  class="is-flex align-items-center justify-content-center flex-direction-column w-100 h-100">
      <p class="text-loading mr-1">Please wait</p>
        <button class="primary-btn mt-1" @click="mapStore.isLoading = false">CANCEL</button>
    </div>
  </div>  

  <div v-if="mapStore.isLocationInActive" class="card p-1">
    <div class="is-flex align-items-center justify-content-center flex-direction-column w-100 h-100">
      <h1>Location Permision Required!</h1>
      <button class="primary-btn  mt-1" @click="mapStore.isLocationInActive = false; mapStore.isMapLoading = false">CLOSE</button>
    </div>
  </div> 
   
</template>

<script setup lang="ts">
 import { useMapStore } from '@/stores/map'
const mapStore = useMapStore()
</script>
