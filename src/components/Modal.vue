<template lang="">

  <div v-show="isLoading" class="card p-1">
    <div  class="is-flex align-items-center justify-content-center flex-direction-column w-100 h-100">
      <p class="text-loading mr-1">Please wait</p>
        <button class="primary-btn mt-1" @click="$emit('click-cancel-btn')">CANCEL</button>
    </div>
  </div>  

  <div v-show="isLocationInActive" class="card p-1">
    <div class="is-flex align-items-center justify-content-center flex-direction-column w-100 h-100">
      <h1>Location required.</h1>
      <button class="primary-btn  mt-1" @click="$emit('click-close-btn')">CLOSE</button>
    </div>
  </div> 
   
</template>

<script setup lang="ts">
defineProps<{ isLoading?: boolean, isLocationInActive?: boolean}>();
</script>
