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
            <ul>
                <li v-for="(channel, index) in appStore.channels" :key="index">
                    {{ channel.name }}
                </li>
            </ul>
        </section>

        <!-- Friends Section -->
        <section class="friends">
            <div class="section-header">
                <h2>Friends</h2>
                <button @click="addFriend">+</button>
            </div>
            <ul>
                <li v-for="(friend, index) in appStore.friends" :key="index">
                    {{ friend.fullname }}
                </li>
            </ul>
        </section>
    </div>
</template>

<script setup lang="ts">
    import { ref } from "vue";
    import { useAppStore } from "../stores/app";

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
</script>

<style scoped>

    .channels {
        flex: 1;
    }

    .friends {
        flex: 1;
    }

    .side-panel {
        width: 100%;
        background-color: #f3f4f6;
        /* padding: 1rem; */
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
    }

    h2 {
        color: black;
    }
</style>