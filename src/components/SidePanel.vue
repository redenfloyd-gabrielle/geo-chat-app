<template>
    <div class="side-panel">
        <!-- Header Section -->
        <section class="side-panel-header">
            <h1>Chat - Geo</h1>
        </section>

        <!-- Channels Section -->
        <section class="channels">
            <div class="section-header">
                <h2>Channels</h2>
                <button @click="showAddChannelModal = true">+</button>
            </div>
            <div class="ul-section">
                <ul>
                    <li v-for="(channel, index) in appStore.channels" :key="index"
                        :class="{ active: channel.uuid === selectedChannel.uuid }"
                        @click="appStore.selectChannel(channel)">
                        {{ channel.name }}
                    </li>
                </ul>
            </div>
        </section>

        <!-- Friends Section -->
        <section class="friends">
            <div class="section-header">
                <h2>Friends</h2>
                <button @click="showAddFriendModal = true">+</button>
            </div>
            <div class="ul-section">
                <ul>
                    <li v-for="(friend, index) in appStore.friends" :key="index" :class="{ active: false }"
                        @click="appStore.selectFriend(friend)">
                        {{ friend.fullname }}
                    </li>
                </ul>
            </div>
        </section>

        <!-- Logout Section -->
        <section class="friends">
            <div class="logout-section">
                <button class="btn btn-primary" @click="appStore.logoutUser">Logout</button>
            </div>
        </section>
    </div>
    <AddChannelModal :isOpen="showAddChannelModal" :friends="friends" @close="showAddChannelModal = false"
        @add-channel="addChannel" />
    <AddFriendModal :isOpen="showAddFriendModal" @close="showAddFriendModal = false" @friend-added="addFriend" />
</template>

<script setup lang="ts">
    import { computed, ref } from "vue";
    import { useAppStore } from "../stores/app";
    import AddChannelModal from './modal/AddChannelModal.vue'; // Adjust path as needed
    import AddFriendModal from "./modal/AddFriendModal.vue";

    const appStore = useAppStore()
    const showAddChannelModal = ref(false)
    const showAddFriendModal = ref(false)

    const friends = ref(appStore.friends)

    // Handle adding a new channel
    const addChannel = (channel: any) => {
        console.log('New Channel:', channel);
        appStore.addChannel(channel)
    };

    // Handle adding friend
    const addFriend = (email: string) => {
        console.log('Friend email:', email);
        // Call backend API to add friend or update friends list
    };

    const selectedChannel = computed(() => {
        return appStore.selectedChannel
    })

</script>

<style scoped>

    .channels .friends {
        flex: 1;
        overflow: scroll;
    }

    .logout-section {
        display: flex;
        border-top: solid black;
        padding-top: 1rem;
        justify-content: center;
        align-items: center;
    }

    .side-panel {
        width: auto;
        background-color: #f3f4f6;
        padding: 0 1rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        border-right: 1px solid #ddd;
    }

    .side-panel-header {
        padding-top: 1rem;
    }

    .side-panel-header h1 {
        font-size: 1.5rem;
        margin: 0;
        color: #333;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: solid black;
        padding-top: 1rem;
    }

    .section-header h2 {
        margin: 0;
        font-size: 1.2rem;
    }

    /* button {
        background-color: #4caf50;
        color: white;
        border: none;
        padding: 0.3rem 0.5rem;
        border-radius: 4px;
        cursor: pointer;
    } */

    /* button:hover {
        background-color: #45a049;
    } */

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    li {
        color: black;
        padding: 0.5rem;
        border-bottom: 1px solid #ddd;
        cursor: pointer;
        /* Makes the list item feel clickable */
        transition: background-color 0.3s ease;
        /* Smooth transition */
    }

    /* Hover state with a light blue background */
    li:hover {
        background-color: #e0f3ff;
        /* Light blue shade */
    }

    /* Active state with a deeper blue background */
    li.active {
        background-color: #b3e0ff;
        /* Slightly darker blue shade */
    }

    h2 {
        color: black;
    }

    .ul-section {
        /* height: 100%; */
        height: 40vh;
        overflow: auto;
    }
</style>