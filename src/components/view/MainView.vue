<template>
  <main>
    <aside class="left">
      <SidePanel />
    </aside>
    <section>
      <!-- <Chat />
        <Map /> -->

      <RouterView />
      <div class="side-panel-mobile">
        <SidePanel />
      </div>
    </section>
    <!-- <aside class="right">
        <UserForm :initialUser="loginUser" @submit="handleFormSubmit" @cancel="closeForm" />
      </aside> -->
  </main>
</template>

<script setup>
  import SidePanel from '../SidePanel.vue';
  import { computed, onMounted } from 'vue';
  import { useAppStore } from '../../stores/app';
  import UserForm from '../form/UserForm.vue';

  const appStore = useAppStore()

  const loginUser = computed(() => {
    return appStore.user
  })

  onMounted(() => {

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

  .side-panel-mobile {
    display: none;
  }
</style>