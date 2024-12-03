<template>
  <Modal />
  <div :key="appStore.thisChannel.uuid" class="chat-container">
    <div class="btn-container">
      <button class="btn btn-secondary" @click="mapStore.checkPermission"> {{ mapStore.isMapLoading ? ' Please Wait...'
        :
        'Share Location' }} </button>
      <button class="btn btn-secondary go-back-btn" @click="clickGoBackBtn">Go Back </button>
      <!-- <button class="btn btn-secondary go-back-btn"
        @click="router.push({ name: 'home', params: { uuid: userStore.thisUser.uuid } })">Go Back </button> -->
    </div>
    <div v-if="channel.type === CHANNEL_TYPE.GROUP" class="channel-header">
      <h2>{{ channel.name }}</h2>
      <p>{{ channelParticipants ?? 0 }} participants</p>
    </div>
    <div v-if="channel.type === CHANNEL_TYPE.DIRECT_MESSAGE" class="channel-header">
      <h2>{{ friendName }}</h2>
      <!-- <p>{{ channelParticipants ?? 0 }} participants</p> -->
    </div>

    <div ref="messageContainer" class="message-list">
      <div v-for="(msg, index) in appStore.selectedMessages" :key="index" class="message"
        :class="{ 'own-message': msg.user?.uuid === appStore.user.uuid }">
        <strong :class="{ 'own-message-name': msg.user?.uuid === appStore.user.uuid }" class="message-name">
          <!-- {{ appStore.getUserFullname(msg.user?.uuid ?? '') }} -->
          {{ msg.user?.fullname }}
        </strong>
        <span :class="{ 'own-message-content': msg.user?.uuid === appStore.user.uuid }" class="message-content"
          v-html="appStore.decryptMessages[index]">
        </span>
      </div>
    </div>

    <div class="editor-container">
      <input hidden ref="fileInput" id="attachedFile" accept="image/*" type="file" @change="handleFileUpload"
        class="file-input" />
      <button @click="triggerFileInput" class="attach-file-button ">Attach File</button>
      <EditorContent :editor="editor" class="editor" @keydown="handleKeyDown" />
      <button @click="sendMessage" class="send-button">Send</button>
    </div>
  </div>
</template>


<script setup lang="ts">
  import { ref, onBeforeUnmount, computed, onMounted, watch, nextTick } from 'vue'
  import { useEditor, EditorContent } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'
  import Mention from '@tiptap/extension-mention'
  import Image from '@tiptap/extension-image'
  import { CHANNEL_TYPE, type Channel, type Friend, type Message, type User } from '../stores/types'
  import { useAppStore } from '../stores/app'
  import { useUserStore } from '../stores/user'
  import { useRouter } from 'vue-router'
  import { useWsStore } from '@/stores/ws'
  import { useHelperStore } from '@/stores/helper'
  import { useMapStore } from '@/stores/map'
  import Modal from './Modal.vue'
  defineProps({
    chat_uuid: {
      type: String,
      required: true,
    },
  })
  // Variable Declaration
  const appStore = useAppStore()
  const router = useRouter()
  const wsStore = useWsStore()
  const userStore = useUserStore()
  const messageContainer = ref()
  const helperStore = useHelperStore()
  const mapStore = useMapStore()
  const users = computed(() => {
    return appStore.friends
  })

  const channel = computed(() => {
    console.log('appStore.selectedChannel', appStore.selectedChannel)
    return appStore.selectedChannel
  })

  const channelParticipants = computed(() => {
    return appStore.selectedChannel.user_uuids?.length
  })

  let attachedFile = ref()

  // Ref to access the file input element
  const fileInput = ref()

  // Custom Mention Extension
  const CustomMention = Mention.extend({
    renderHTML({ node }) {
      return ['span', { class: 'mention' }, `@${node.attrs.label}`]
    },
  })

  // Initialize Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'attached-file-image',
        },
      }),
      CustomMention.configure({
        suggestion: {
          items: ({ query }) =>
            users.value.filter((user) =>
              user.fullname.toLowerCase().startsWith(query.toLowerCase())
            ),
        },
      }),
    ],
    content: '',
  })

  // Send Message Handler
  const sendMessage = async () => {
    if (editor.value) {
      const content = editor.value.getHTML().trim()
      if (content) {
        const newMessage = {
          user_uuid: appStore.user.uuid,
          channel_uuid: appStore.selectedChannel.uuid,
          message: await appStore.encryptMessage(content)
        } as Message

        await appStore.addMessage(newMessage)

        editor.value.commands.clearContent()
      }
    }
  }

  // Handle Enter Key Press to Send Message
  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault() // Prevent new line
      sendMessage() // Send message
    }
  }

  // Trigger the file input
  const triggerFileInput = () => {
    if (!fileInput.value) {
      return
    }
    fileInput.value.click()
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string) // Base64 string
      reader.onerror = (error) => reject(error)
    })
  }

  // Handle File Upload
  const handleFileUpload = async (event: Event) => {
    const fileInput = event.target as HTMLInputElement
    if (!fileInput.files || fileInput.files.length === 0) return

    const file = fileInput.files[0]

    // Convert to Base64
    try {
      // const base64String = await convertToBase64(file)
      const filePath = await helperStore.uploadFileViaFormData(file)
      // const _filePath = await helperStore.uploadFile(file)

      // Save to database (replace this with your actual save logic)
      console.log('filePath String:', filePath)

      // For demonstration, render the Base64 image immediately
      if (editor.value && filePath) {
        editor.value.commands.setImage({ src: filePath })
        sendMessage() // Optional: Trigger your message send logic
      }
    } catch (error) {
      console.error('Error converting file to Base64:', error)
    }
  }

  // Handle File Upload
  const _handleFileUpload = async (event: any) => {
    const file = event.target.files[0]
    if (file && editor.value) {
      attachedFile.value = {
        name: file.name,
        url: URL.createObjectURL(file),
      }

      editor.value.commands.setImage({ src: attachedFile.value.url })
      sendMessage()
    }
  }

  // Auto-scroll function
  const scrollToBottom = async () => {
    await nextTick() // Wait for DOM updates
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  }

  // Watch for new messages and scroll to the bottom
  watch(
    () => appStore.selectedMessages.length,
    () => {
      scrollToBottom()
    },
    { deep: true } // Ensures it reacts to content changes inside the array
  )

  const friendName = computed(() => {
    // const friend = channel.value.users?.find(f => f.uuid !== appStore.user.uuid)
    // if (friend) {
    return appStore.selectedFriend.fullname
    // }
  })

  const clickGoBackBtn = () => {
    appStore.setChannel({} as Channel)
    appStore.setFriend({} as User)
  }

  // Vue lifecycle

  onMounted(() => {
    console.log('CHAT ON MOUNTED')
    setTimeout(() => {
      scrollToBottom()
    }, 50)
  })

  // Clean up Editor on Component Unmount
  onBeforeUnmount(() => {
    editor.value?.destroy()
    wsStore.leaveChannel(appStore.selectedChannel.uuid)
  })
</script>


<style scoped>

  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 100%;
    margin: 0 auto;
    border: 1px solid #ddd;
    font-family: Arial, sans-serif;
    position: relative;
  }

  .btn-container {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    background-color: #f0f0f0;
    position: sticky;
    top: 0;
    z-index: 1000;
  }

  .btn-secondary {
    padding: 8px 12px;
    background-color: #4c4c4c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .channel-header {
    text-align: center;
    padding: 10px;
    background-color: #007bff;
    color: white;
  }

  .message-list {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
    background-color: #f9f9f9;
  }

  .message {
    padding: 8px 12px;
    margin-bottom: 5px;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
  }

  /* .message-content {
    background-color: #4c4c4c;
    color: white;
    padding: 10px;
    border-radius: 10px;
    font-size: 14px;
    max-width: 40%;
    word-wrap: break-word;
  } */

  .message-content {
    background-color: #4c4c4c;
    color: white;
    padding: 10px;
    border-radius: 10px;
    font-size: 14px;
    /* max-width: 70%; */
    width: fit-content;
    /* Width adjusts to the content */
    word-wrap: break-word;
    /* Ensures words wrap if they exceed max width */
    white-space: pre-wrap;
    /* Preserves line breaks and spaces */
  }

  .own-message {
    align-items: flex-end;
  }

  .own-message-content {
    background-color: #0080ff;
  }

  .editor-container {
    display: flex;
    padding: 10px;
    background-color: white;
    border-top: 1px solid #ddd;
    align-items: center;
  }

  .editor {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .send-button,
  .attach-file-button {
    padding: 8px 12px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    margin-left: 10px;
  }

  .send-button:hover,
  .attach-file-button:hover {
    background-color: #0056b3;
  }

  /* Mobile Responsive Design */
  @media (max-width: 768px) {

    .message-content {
      max-width: 90%;
    }

    .btn-container {
      flex-direction: row;
      gap: 10px;
    }

    .editor-container {
      flex-direction: row;
      gap: 10px;
    }
  }
</style>