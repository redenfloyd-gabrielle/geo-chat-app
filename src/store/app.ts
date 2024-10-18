import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { Message, User, Channel } from "./types";
import { faker } from "@faker-js/faker";

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

    // Computed Functions

    const getUserFullname = computed(() => (uuid: string) => {
        return friends.value.find(f => f.uuid === uuid)?.fullname
    })

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

    const _generateMessage = (n: number) => {
        for (let index = 0; index < n; index++) {
            const newMessage = {
                uuid: faker.string.uuid(),
                channel_uuid: faker.helpers.arrayElement(channels.value).uuid,
                user_uuid: faker.helpers.arrayElement(friends.value).uuid,
                message: faker.lorem.lines(3),
                created_on: faker.number.int({ min: 99999 }),

            } as Message

            messages.value?.push(newMessage)
        }
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
        setRandomUser,
        getMessagesByChannel,
        selectChannel,
        selectFriend,
        _generateFriends,
        _generateChannels,
        _generateMessage,
    }
})