<template>
  <RouterView />
</template>

<script setup>
  import { useAppStore } from './stores/app';
  import { onMounted, onUnmounted } from 'vue';
  import { useWsStore } from './stores/ws'
  import { useSeesionStore } from './stores/session';

  const appStore = useAppStore()
  const wsStore = useWsStore()
  const sessionStore = useSeesionStore()

  onMounted(() => {
    appStore.initializeApiInstance()
    const _session = sessionStore.getSession()

    if (_session) {
      sessionStore.session = _session
    }

    wsStore.connect()
    wsStore.joinChannel('geo-chat-ap')

    // appStore._generateFriends(5)

    // wsStore.connect()
    // appStore._generateChannels(5)
    // appStore._generateMessage(20)
    // appStore.setRandomUser()
    // setTimeout(() => {
    //   console.log('appStore.channels[0', appStore.channels[0])
    //   const channel = appStore.channels[0]
    //   appStore.setChannel(channel)
    // }, 500);
  })

  onUnmounted(() => {
    wsStore.leaveChannel('geo-chat-ap')
    wsStore.disconnect('geo-chat-ap')
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
