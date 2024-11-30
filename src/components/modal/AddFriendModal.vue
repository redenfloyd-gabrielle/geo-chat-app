<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <h2>{{ isEditMode ? "Edit Friend" : "Add Friend" }}</h2>
      <form @submit.prevent="handleAddFriend">
        <div class="form-group">
          <label for="friendEmail">Friend's Email</label>
          <input class="input-text-modal" id="friendEmail" type="email" v-model="friendEmail"
            placeholder="Enter friend's email" required :disabled="isEditMode" />
        </div>
        <div v-if="isEditMode" class="form-group">
          <label for="friendEmail">Friend's fullname</label>
          <input class="input-text-modal" id="friendEmail" type="email" v-model="friend.fullname"
            placeholder="Enter friend's email" required :disabled="isEditMode" />
        </div>

        <div class="modal-actions">
          <button type="submit" class="btn btn-primary" :class="{ 'btn-danger': isEditMode }">{{ isEditMode ?
            "Unfriend" : "Add Friend" }}</button>
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, defineEmits, watch, computed, onMounted } from 'vue'
  import { type User } from '../../stores/types'
  import { useUserStore } from '@/stores/user'

  // Props
  const props = defineProps<{
    isOpen: boolean
    friend: User
  }>()

  // Emit events
  const emit = defineEmits(['close', 'friend-added', 'unfriended'])

  const friendEmail = ref()
  const isEditMode = computed(() => !!props.friend.uuid)
  const userStore = useUserStore()

  // Close modal
  const closeModal = () => {
    emit('close')
  }

  // Handle adding a friend
  const handleAddFriend = () => {
    if (friendEmail.value) {
      if (!isEditMode.value) {
        emit('friend-added', friendEmail.value) // Send the friend's email to parent component
      }
      else {
        emit('unfriended', friendEmail.value) // Send the friend's email to parent component
      }
      friendEmail.value = '' // Clear input
      closeModal()
    }
  }

  watch(() => props.friend, (value, _) => {
    friendEmail.value = value.email ?? ""
  })

  onMounted(async () => {
    userStore.users = await userStore.getUsers() ?? [] as User[]
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
    display: flex;
    justify-content: space-between;
  }

  .btn-danger {
    background-color: #dc3545;
    color: white;
  }
</style>