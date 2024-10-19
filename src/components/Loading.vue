<template lang="">
  <div v-show="isShow" class="card">
    <div class="is-flex align-items-center justify-content-center w-100 h-100">
      Please wait...
    </div>
  </div>  
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
  isShow: boolean;
}>();
</script>
