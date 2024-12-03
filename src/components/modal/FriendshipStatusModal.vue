<template>
    <div v-if="isOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
            <h2 class="mb-1">{{ "Friend Request List" }}</h2>
            <div class="is-flex flex-gap-1" v-for="friend in appStore.friendshipRequestList">
                <div class="is-flex align-items-center w-100">
                    <label v-if="friend.user1_uuid === appStore.user.uuid">{{ friend.user2?.fullname }}</label>
                    <label v-if="friend.user2_uuid === appStore.user.uuid">{{ friend.user1?.fullname }}</label>
                </div>
                <div class="modal-actions">
                    <!-- Three button -->
                    <!-- (Accept, Delete Request), Reject -->
                    <button v-if="friend.user1_uuid === appStore.user.uuid" @click="acceptFriendship(friend)"
                        class="btn btn-primary">Accept</button>
                    <button v-if="friend.user2_uuid === appStore.user.uuid" @click="deleteFriendship(friend)"
                        class="btn btn-primary btn-danger">Delete
                        Request</button>
                    <button v-if="friend.user1_uuid === appStore.user.uuid" @click="deleteFriendship(friend)"
                        class="btn btn-secondary"> Reject </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, defineEmits, watch, computed, onMounted } from 'vue'
    import { FRIENDSHIP_STATUS, WS_EVENT, type Friend, type User, type WebsocketMessage } from '../../stores/types'
    import { useUserStore } from '@/stores/user'
    import { useFriendshipStore } from '@/stores/friendship'
    import { useAppStore } from '@/stores/app'
    import { useWsStore } from '@/stores/ws'

    const friendShipStore = useFriendshipStore()
    const appStore = useAppStore()
    const wsStore = useWsStore()

    // Props
    const props = defineProps<{
        isOpen: boolean
    }>()

    // Emit events
    const emit = defineEmits(['close'])

    const acceptFriendship = async (friendship: Friend) => {
        friendship.status = FRIENDSHIP_STATUS.Accepted
        const _friendship = await friendShipStore.updateFriend(friendship)

        if (_friendship) {
            const wsMessage = {
                event: WS_EVENT.UPDATE_FRIENSHIP_STATUS,
                data: _friendship
            } as WebsocketMessage

            wsStore.sendMessage(wsMessage)
        }
    }
    const deleteFriendship = async (friendship: Friend) => {
        const _friendship = await friendShipStore.deleteFriend(friendship)

        if (_friendship) {
            const wsMessage = {
                event: WS_EVENT.DELETE_FRIEND_REQUEST,
                data: _friendship
            } as WebsocketMessage

            wsStore.sendMessage(wsMessage)

            appStore.friendshipRequestList.push(_friendship)
        }
    }

    // Close modal
    const closeModal = () => {
        emit('close')
    }

    watch(() => appStore.friendshipRequestList.length, (value) => {
        if (value === 0) {
            closeModal()
        }
    })
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
        width: 100%;
        display: flex;
        justify-content: space-evenly;
        margin-top: 5px;
        margin-bottom: 5px;
        gap: 1em;
    }

    .btn-danger {
        background-color: #dc3545;
        color: white;
    }
</style>