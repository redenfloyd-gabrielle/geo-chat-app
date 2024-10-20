<template>
    <div class="modal-backdrop" v-if="isOpen">
        <div class="modal">
            <h2>Add New Channel</h2>
            <form @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="name">Channel Name</label>
                    <input class="input-text-modal" v-model="channel.name" id="name" type="text" required />
                </div>

                <!-- <div class="form-group">
                    <label for="type">Channel Type</label>
                    <select v-model="channel.type" id="type" required>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                </div> -->

                <div class="form-group">
                    <label>Select Users</label>
                    <div class="checkbox-group">
                        <div v-for="friend in friends" :key="friend.uuid" class="checkbox-item">
                            <input type="checkbox" :id="`user-${friend.uuid}`" :value="friend.uuid"
                                v-model="channel.user_uuids" />
                            <label :for="`user-${friend.uuid}`">{{ friend.fullname }}</label>
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Add Channel</button>
                    <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    //   import { v4 as uuidv4 } from 'uuid';
    import { CHANNEL_TYPE, User, type Channel } from '../../stores/types'; // Adjust as needed

    // Props from parent
    const props = defineProps<{
        isOpen: boolean;
        friends: User[];
    }>();

    // Emit events to parent
    const emit = defineEmits(['close', 'add-channel']);

    // State for new channel
    const channel = ref<Channel>({
        uuid: '',
        name: '',
        user_uuids: [],
        type: CHANNEL_TYPE.GROUP,
        created_on: new Date().toISOString(),
    });

    // Handle form submission
    const handleSubmit = () => {
        if (channel.value.user_uuids.length === 0) return
        // channel.value.uuid = uuidv4(); // Generate unique UUID
        channel.value.type = channel.value.user_uuids.length === 1 ? CHANNEL_TYPE.DIRECT_MESSAGE : CHANNEL_TYPE.GROUP
        emit('add-channel', { ...channel.value }); // Emit new channel data
        closeModal();
    };

    // Close the modal
    const closeModal = () => {
        emit('close');
    };
</script>

<style scoped>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
    }

    .modal {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        width: 400px;
        max-width: 100%;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
    }

    .checkbox-group {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        height: 30vh;
        overflow: auto;
    }

    .checkbox-item {
        display: flex;
        align-items: center;
    }

    .checkbox-item input {
        margin-right: 0.5rem;
    }

    .form-actions {
        display: flex;
        justify-content: space-between;
    }
</style>