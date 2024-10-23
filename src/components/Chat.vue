<template>
    <div class="chat-container">
        <div class="btn-container">
            <button class="btn btn-secondary" @click="appStore.mapBtnClick"> Map </button>
            <button class="btn btn-secondary" @click="">Go Back</button>
        </div>

        <div class="channel-header">
            <h2>{{ channel.name }}</h2>
            <p>{{ channelParticipants ?? 0 }} participants</p>
        </div>

        <div ref="messageContainer" class="message-list">
            <div v-for="(msg, index) in appStore.selectedMessages" :key="index" class="message"
                :class="{ 'own-message': msg.user_uuid === appStore.user.uuid }">
                <strong :class="{ 'own-message-name': msg.user_uuid === appStore.user.uuid }" class="message-name">
                    {{ appStore.getUserFullname(msg.user_uuid) }}</strong>
                <span :class="{ 'own-message-content': msg.user_uuid === appStore.user.uuid }" class="message-content"
                    v-html="appStore.decryptMessages[index]">
                </span>
            </div>
        </div>

        <div class="editor-container">
            <input hidden ref="fileInput" id="attachedFile" type="file" @change="handleFileUpload" class="file-input" />
            <button @click="triggerFileInput" class="attach-file-button">Attach File</button>
            <EditorContent :editor="editor" class="editor" @keydown="handleKeyDown" />
            <button @click="sendMessage" class="send-button">Send</button>
        </div>
    </div>
</template>


<script setup lang="ts">
    import { ref, onBeforeUnmount, computed, onMounted, watch } from 'vue';
    import { useEditor, EditorContent } from '@tiptap/vue-3';
    import StarterKit from '@tiptap/starter-kit';
    import Mention from '@tiptap/extension-mention';
    import Image from '@tiptap/extension-image'
    import { Message } from '../stores/types';
    import { useAppStore } from '../stores/app';
    import { useRouter } from 'vue-router';

    // Variable Declaration
    const appStore = useAppStore()
    const router = useRouter()

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

    let attachedFile = ref();

    // Ref to access the file input element
    const fileInput = ref();

    // Custom Mention Extension
    const CustomMention = Mention.extend({
        renderHTML({ node }) {
            return ['span', { class: 'mention' }, `@${node.attrs.label}`];
        },
    });

    const messageContainer = ref()

    // Functions
    // Function to scroll to the bottom of the message list
    const scrollToBottom = () => {
        if (messageContainer.value) {
            messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
        }
    };

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
    });

    // Send Message Handler
    const sendMessage = async () => {
        if (editor.value) {
            const content = editor.value.getHTML().trim();
            if (content) {
                const newMessage = {
                    user_uuid: appStore.user.uuid,
                    channel_uuid: appStore.selectedChannel.uuid,
                    message: await appStore.encryptMessage(content)
                } as Message
                appStore.messages.push(newMessage);
                editor.value.commands.clearContent();
            }
        }
    };

    // Handle Enter Key Press to Send Message
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent new line
            sendMessage(); // Send message
        }
    };

    // Trigger the file input
    const triggerFileInput = () => {
        if (!fileInput.value) {
            return
        }
        fileInput.value.click();
    };

    // Handle File Upload
    const handleFileUpload = async (event: any) => {
        const file = event.target.files[0];
        if (file && editor.value) {
            attachedFile.value = {
                name: file.name,
                url: URL.createObjectURL(file),
            };

            editor.value.commands.setImage({ src: attachedFile.value.url })
            sendMessage()
        }
    };

    // Vue lifecycle

    onMounted(() => {
        scrollToBottom();
    })

    // Clean up Editor on Component Unmount
    onBeforeUnmount(() => {
        editor.value?.destroy();
    });
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

    .message-content {
        background-color: #4c4c4c;
        color: white;
        padding: 10px;
        border-radius: 10px;
        font-size: 14px;
        max-width: 70%;
        word-wrap: break-word;
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