<template>
  <main>
    <aside class="left">
      <SidePanel  />
    </aside>
    <section> 
      <Chat /> 
      <Map />
    </section>
  </main>
</template>

<script setup>
  import Chat from './components/chat.vue'
  import SidePanel from './components/SidePanel.vue';
  import Map from './components/Map.vue';
  import { onMounted } from 'vue';
  import { useAppStore } from './stores/app';

  const appStore = useAppStore()

  onMounted(() => {
    appStore._generateFriends(10)
    appStore._generateChannels(3)
    appStore._generateMessage(100)
    appStore.setRandomUser()
  })
</script>

<style scoped>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }

  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }

  .logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
  }
</style>
