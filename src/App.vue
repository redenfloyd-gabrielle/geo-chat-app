<template>
  <main>
    <aside class="left">
      <SidePanel />
    </aside>
    <section>
      <Chat />
      <Map />
    </section>
    <aside class="right">
      <UserForm :initialUser="loginUser" @submit="handleFormSubmit" @cancel="closeForm" />
    </aside>
  </main>
</template>

<script setup>
  import Chat from './components/chat.vue'
  import SidePanel from './components/SidePanel.vue';
  import Map from './components/Map.vue';
  import { computed, onMounted } from 'vue';
  import { useAppStore } from './stores/app';
  import UserForm from './components/form/UserForm.vue';

  const appStore = useAppStore()

  const loginUser = computed(() => {
    return appStore.user
  })

  onMounted(() => {
    appStore._generateFriends(100)
    appStore._generateChannels(5)
    appStore._generateMessage(20)
    appStore.setRandomUser()
    setTimeout(() => {
      console.log('appStore.channels[0', appStore.channels[0])
      const channel = appStore.channels[0]
      appStore.selectChannel(channel)
    }, 500);
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
