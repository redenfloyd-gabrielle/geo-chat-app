<template>
    <div class="side-panel">
        <!-- Header Section -->
        <header class="header">
            <h1>Chat - Geo</h1>
        </header>

        <!-- Channels Section -->
        <section class="channels">
            <div class="section-header">
                <h2>Channels</h2>
                <button @click="addChannel">+</button>
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
                <button @click="addFriend">+</button>
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
    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from "vue";
    import { useAppStore } from "../store/app";

    const channels = ref(["General", "Announcements", "Support"]);
    const friends = ref(["Alice", "Bob", "Charlie"]);
    const appStore = useAppStore()

    const addChannel = () => {
        const name = prompt("Enter channel name:");
        if (name) channels.value.push(name);
    };

    const addFriend = () => {
        const name = prompt("Enter friend name:");
        if (name) friends.value.push(name);
    };

    const selectedChannel = computed(() => {
        return appStore.selectedChannel
    })

</script>

<style scoped>

    .channels {
        flex: 1;
        overflow: scroll;
    }

    .friends {
        flex: 1;
        overflow: scroll;
    }

    .side-panel {
        width: 25dvw;
        background-color: #f3f4f6;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        border-right: 1px solid #ddd;
    }

    .header h1 {
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

    button {
        background-color: #4caf50;
        color: white;
        border: none;
        padding: 0.3rem 0.5rem;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background-color: #45a049;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    li {
        color: black;
        padding: 0.5rem 0;
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
        height: 100%;
        overflow: auto;
    }
</style>