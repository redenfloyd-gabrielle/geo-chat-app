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
        <button @click="editChannel">+</button>
      </div>
      <div class="ul-section">
        <ul>
          <li v-for="(channel, index) in appStore.groupChannels" :key="index"
            :class="{ active: channel.uuid === selectedChannel.uuid }" @click="appStore.setChannel(channel)">
            <div>
              {{ channel.name }}
            </div>
            <button class="edit-button" @click="editChannel(channel)">Edit</button>
          </li>
        </ul>
      </div>
    </section>

    <!-- Friends Section -->
    <section class="friends">
      <div class="section-header">
        <h2>Friends</h2>
        <button @click="editFriend({} as User)">+</button>
      </div>
      <div class="ul-section">
        <ul>
          <li v-for="(friend, index) in appStore.friends" :key="index"
            :class="{ active: friend.uuid === appStore.selectedFriend.uuid }" @click="appStore.setFriend(friend)">
            <div>
              {{ friend.fullname }}
            </div>
            <button class="edit-button" @click="editFriend(friend)">Edit</button>
          </li>
        </ul>
      </div>
    </section>

    <!-- Logout Section -->
    <section class="logout-section">
      <button class="btn btn-seconday" @click="appStore.logoutUser">Logout</button>
      <button class="btn btn-primary" @click="appStore.clickUserBtn">User</button>
    </section>
  </div>

  <!-- Modals -->
  <AddChannelModal :isOpen="showAddChannelModal" :initialChannel="appStore.thisChannel" :friends="appStore.friends"
    @close="showAddChannelModal = false" @add-channel="addChannel" />
  <AddFriendModal :isOpen="showAddFriendModal" :friend="appStore.thisFriend" @close="showAddFriendModal = false"
    @friend-added="addFriend" @unfriended="unfriended" />
</template>

<script setup lang="ts">
  import { computed, ref } from "vue"
  import { useAppStore } from "../stores/app"
  import AddChannelModal from './modal/AddChannelModal.vue' // Adjust path as needed
  import AddFriendModal from "./modal/AddFriendModal.vue"
  import type { Channel, Friend, User } from "../stores/types"
  import { useSeesionStore } from "@/stores/session"
  import { useFriendshipStore } from "@/stores/friendship"
  import { useUserStore } from "@/stores/user"
  import router from "@/router"

  const appStore = useAppStore()
  const sessionStore = useSeesionStore()
  const friendshipStore = useFriendshipStore()
  const userStore = useUserStore()
  const showAddChannelModal = ref(false)
  const showAddFriendModal = ref(false)

  const addChannel = (channel: any) => {
    appStore.addChannel(channel)
  }

  const addFriend = async (email: string) => {
    console.log('Friend email:', email)

    const user1 = userStore.users.find(u => u.email === email)
    if (user1) {
      const newFriendShip = {} as Friend

      newFriendShip.user1_uuid = user1.uuid
      newFriendShip.user2_uuid = appStore.user.uuid
      newFriendShip.created_on = Date.now()

      await friendshipStore.addFriend(newFriendShip)
    }
    // Call backend API to add friend or update friends list
  }

  const unfriended = async (friendEmail: string) => {
    const friendship = friendshipStore.friendships.find((friendship) => {
      // Check if user1 or user2 in the friendship matches the friendEmail
      if (friendship.user1_uuid === appStore.user.uuid && friendship.user2?.email === friendEmail) {
        return true // Match found with user2
      } else if (friendship.user2_uuid === appStore.user.uuid && friendship.user1?.email === friendEmail) {
        return true // Match found with user1
      }
      return false // No match
    })

    if (!friendship) {
      throw new Error(`No friendship found for email: ${friendEmail}`)
    }

    console.log('DELETE FRIENDSHIP ', friendship)
    const _friend = await friendshipStore.deleteFriend(friendship)

    if (_friend) {
      const idx = friendshipStore.friendships.findIndex(f => f.uuid === _friend.uuid)
      if (idx != 1) {
        friendshipStore.friendships.splice(idx, 1)
        appStore.setFriend({} as User)
        appStore.setChannel({} as Channel)
      }
    }

    return friendship // Return the found friendship
  }

  const editChannel = (channel: any) => {
    // Logic for editing a specific channel
    console.log('Edit Channel:', channel)
    appStore.setChannel(channel ?? {} as Channel)
    showAddChannelModal.value = true
  }

  const editFriend = (friend: User) => {
    // Logic for editing a specific friend
    console.log('Edit Friend:', friend)
    appStore.setFriend(friend)
    showAddFriendModal.value = true
  }

  const selectedChannel = computed(() => appStore.selectedChannel)
</script>

<style scoped>
  .side-panel {
    display: flex;
    flex-direction: column;
    width: auto;
    max-width: 350px;
    background-color: #f3f4f6;
    padding: 1rem;
    border-right: 1px solid #ddd;
    gap: 1rem;
    justify-content: space-between;
    height: 100%;
  }

  .side-panel-header {
    text-align: center;
  }

  .side-panel-header h1 {
    font-size: 1.5rem;
    color: #333;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-header h2 {
    font-size: 1.2rem;
    color: #333;
  }

  .ul-section {
    height: 45vh;
    overflow-y: auto;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #ddd;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  li:hover {
    background-color: #e0f3ff;
  }

  li.active {
    background-color: #b3e0ff;
  }

  .edit-button {
    background-color: #f3f4f6;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 2px 8px;
    margin-left: 10px;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .edit-button:hover {
    background-color: #ddd;
  }

  .logout-section {
    gap: 2rem;
    margin-top: auto;
    text-align: center;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
  }

  .btn {
    padding: 8px 12px;
    /* background-color: #007bff; */
    /* color: white; */
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn:hover {
    background-color: #0056b3;
    color: white;
  }
</style>
