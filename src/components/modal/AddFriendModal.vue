<template>
    <div v-if="isOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
            <h2>Add Friend</h2>
            <form @submit.prevent="handleAddFriend">
                <div class="form-group">
                    <label for="friendEmail">Friend's Email</label>
                    <input class="input-text-modal" id="friendEmail" type="email" v-model="friendEmail" placeholder="Enter friend's email"
                        required />
                </div>

                <div class="modal-actions">
                    <button type="submit" class="btn btn-primary">Add Friend</button>
                    <button type="button" class="btn btn-secondary" @click="closeModal">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, defineProps, defineEmits } from 'vue';

    // Props
    defineProps({
        isOpen: Boolean, // Control modal visibility
    });

    // Emit events
    const emit = defineEmits(['close', 'friend-added']);

    const friendEmail = ref('');

    // Close modal
    const closeModal = () => {
        emit('close');
    };

    // Handle adding a friend
    const handleAddFriend = () => {
        if (friendEmail.value) {
            emit('friend-added', friendEmail.value); // Send the friend's email to parent component
            friendEmail.value = ''; // Clear input
            closeModal();
        }
    };
</script>

<style scoped>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background-color: white;
        padding: 2rem;
        border-radius: 8px;
        max-width: 400px;
        width: 100%;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .modal-actions {
        display: flex;
        justify-content: space-between;
    }
</style>