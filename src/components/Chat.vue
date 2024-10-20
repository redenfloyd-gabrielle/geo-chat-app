<template>
    <div class="chat-container">
        <!-- <div class="user-selector">
            <label for="user">Select User:</label>
            <select v-model="currentUser" id="user">
                <option v-for="user in users" :key="user.id" :value="user">
                    {{ user.username }}
                </option>
            </select>
        </div> -->

        <div class="channel-header">
            <h2>{{ channel.name }}</h2>
            <p>{{ channelParticipants ?? 0 }} participants</p>
        </div>

        <div ref="messageContainer" class="message-list">
            <div v-for="(msg, index) in messages" :key="index" class="message"
                :class="{ 'own-message': msg.user_uuid === currentUser.uuid }">
                <strong :class="{ 'own-message-name': msg.user_uuid === currentUser.uuid }" class="message-name">
                    {{ appStore.getUserFullname(msg.user_uuid) }}</strong>
                <span :class="{ 'own-message-content': msg.user_uuid === currentUser.uuid }" class="message-content"
                    v-html="appStore.decryptMessages[index]">
                </span>
            </div>
        </div>

        <div class="editor-container">
            <input hidden ref="fileInput" id="attachedFile" type="file" @change="handleFileUpload" class="file-input" />
            <button @click="triggerFileInput" class="attach-file-button">Attach File
            </button>
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

    // Variable Declaration
    const appStore = useAppStore()

    const users = computed(() => {
        return appStore.friends
    })

    const messages = computed(() => {
        return appStore.getMessagesByChannel(appStore.selectedChannel)
    }) // Store chat messages

    const channel = computed(() => {
        console.log('appStore.selectedChannel', appStore.selectedChannel)
        return appStore.selectedChannel
    })

    const channelParticipants = computed(() => {
        return appStore.selectedChannel.user_uuids?.length
    })

    const currentUser = computed(() => {
        return appStore.user
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
                    user_uuid: currentUser.value.uuid,
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

    // Watchers
    // Scroll to the bottom whenever messages change
    watch(messages, (value, _) => {
        scrollToBottom();

        value.forEach(async (m, i) => {
            const res = await appStore.decryptMessage(m.message)
            appStore.decryptMessages[i] = res
        })
    });

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

    /* Styling the chat interface */
    .channel-header {
        text-align: center;
        padding: 10px;
        background-color: #007bff;
        color: white;
    }

    .channel-header h2 {
        margin: 0;
        font-size: 18px;
    }

    .channel-header p {
        margin: 0;
        font-size: 14px;
        opacity: 0.8;
    }

    .chat-container {
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        bottom: 0;
        right: 90px;
        z-index: 9999;
        position: absolute;
        display: flex;
        flex-direction: column;
        width: 328px;
        height: 500px;
        /* margin: 50px auto; */
        border: 1px solid #ddd;
        /*border-radius: 8px;*/
        overflow: hidden;
        font-family: Arial, sans-serif;
    }

    .message-list {
        flex: 1;
        padding: 10px;
        overflow-y: auto;
        height: 100%;
        background-color: #f9f9f9;
    }

    .message {
        color: black;
        padding: 8px 12px;
        margin-bottom: 5px;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .message-content {
        color: white;
        background: #4c4c4c;
        padding: 10px;
        border-radius: 1rem;
        font-size: 14px;
        line-height: 1rem;
        max-width: 45dvw;
    }

    .message-name {
        font-size: 14px;
        margin-left: 1rem;
    }

    .own-message {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-end;
    }

    .own-message-content {
        background: #0080ff;
    }

    .own-message-name {
        display: none !important;
    }

    .editor-container {
        display: flex;
        align-items: center;
        padding: 10px;
        background-color: #fff;
        border-top: 1px solid #ddd;
    }

    .editor {
        color: black;
        flex: 1;
        min-height: 50px;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-right: 10px;
        margin-left: 10px;
        overflow-y: auto;
    }

    .send-button {
        padding: 8px 12px;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .send-button:hover {
        background-color: #0056b3;
    }

    .attach-file-button {
        padding: 8px 12px;
        background-color: #4c4c4c;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .attach-file-button:hover {
        background-color: hsla(0, 0%, 30%, 0.75);
    }

    .mention {
        color: #007bff;
        font-weight: bold;
    }

    .suggestion {
        position: absolute;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        z-index: 10;
        max-height: 150px;
        overflow-y: auto;
    }

    .suggestion-item {
        padding: 8px;
        cursor: pointer;
    }

    .suggestion-item:hover {
        background-color: #f1f1f1;
    }
</style>