<template lang="">
  <div v-show="isShow" class="card">
    <div class="is-flex align-items-center justify-content-center is-flex-direction-column w-100 h-100">
      <!-- <div class="is-flex align-items-center  is-flex-direction-row"> -->
        <p class="text-loading mr-1">Please wait...</p>
        
          <button class="primary-btn " @click="$emit('click-cancel-btn')">CANCEL</button>
        
      <!-- </div> -->
    </div>
  
  </div>  
</template>

<script setup lang="ts">
const props = defineProps<{
  isShow: boolean;
}>();
</script>
