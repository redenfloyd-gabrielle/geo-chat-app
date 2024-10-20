import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { Message, User, Channel } from "./types";
import { faker } from "@faker-js/faker";
import { useSecureStore } from "./secure";

export const useAppStore = defineStore('app', () => {
    const user = ref({} as User)
    const friends = ref([] as User[])
    const selectedFriend = ref({} as User)

    const channels = ref([] as Channel[])
    const selectedChannel = ref({} as Channel)
    const thisChannel = ref({} as Channel)

    const messages = ref([] as Message[]) // per channel
    const selectedMessage = ref({} as Message)
    const thisMessage = ref({} as Message)

    const secureStore = useSecureStore()

    const secretString = '3a7eca62-bdc6-44f0-8f3e-abf909c44cf7' // this should be moved to .env

    const decryptMessages = ref([] as string[])

    const isMapView = ref(false)

    // Computed Functions

    const getUserFullname = computed(() => (uuid: string) => {
        return friends.value.find(f => f.uuid === uuid)?.fullname
    })

    const encryptMessage = async (message: string) => {
        return await secureStore.encryptMessage(secretString, message)
    }

    const decryptMessage = async (message: string): Promise<string> => {
        const _message = secureStore.decryptMessage(secretString, message)
        return await _message
    }

    // Methods

    const setRandomUser = () => {
        user.value = friends.value[faker.number.int({ max: 9 })]
    }

    const selectChannel = (payload: Channel) => {
        selectedChannel.value = payload
        thisChannel.value = { ...payload }
    }

    const selectFriend = (payload: User) => {
        selectedFriend.value = payload
    }

    const getMessagesByChannel = (payload: Channel) => {
        return messages.value.filter(m => m.channel_uuid === payload.uuid)
    }

    const addChannel = (payload: Channel) => {
        channels.value.push(payload)
    }

    // Faker
    const _generateFriends = (n: number) => {
        for (let index = 0; index < n; index++) {
            const newFriend = {
                uuid: faker.string.uuid(),
                fullname: faker.person.fullName(),
                email: faker.lorem.text(),
                password: faker.lorem.text(),
                created_on: faker.number.int({ min: 99999 })
            } as User

            friends.value?.push(newFriend)
        }
    }

    const _generateChannels = (n: number) => {
        for (let index = 0; index < n; index++) {
            const newChannel = {
                uuid: faker.string.uuid(),
                name: faker.vehicle.model(),
                user_uuids: friends.value.map(friend => friend.uuid),
                created_on: faker.number.int({ min: 99999 }),
            } as unknown as Channel

            channels.value?.push(newChannel)
        }
    }

    const _generateMessage = async (n: number) => {
        let _messages = [] as Message[]
        for (let index = 0; index < n; index++) {
            const newMessage = {
                uuid: faker.string.uuid(),
                channel_uuid: faker.helpers.arrayElement(channels.value).uuid,
                user_uuid: faker.helpers.arrayElement(friends.value).uuid,
                message: await secureStore.encryptMessage(secretString, faker.lorem.paragraphs(2)),
                created_on: faker.number.int({ min: 99999 }),

            } as Message

            _messages.push(newMessage)
        }

        messages.value.push(..._messages)
    }


    return {
        user,
        friends,
        channels,
        selectedChannel,
        thisChannel,
        messages,
        selectedMessage,
        thisMessage,
        getUserFullname,
        selectedFriend,
        decryptMessages,
        isMapView,
        encryptMessage,
        decryptMessage,
        setRandomUser,
        getMessagesByChannel,
        selectChannel,
        selectFriend,
        addChannel,
        _generateFriends,
        _generateChannels,
        _generateMessage,
    }
})