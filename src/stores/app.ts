import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"
import type { Message, User, Channel, Session } from "./types"
import { HTTP_RESPONSE_STATUS, LOGIN_STATUS } from "./types"
import { faker } from "@faker-js/faker"
import { useSecureStore } from "./secure"
import { useRouter } from "vue-router"
import type { AxiosInstance } from "axios"
import axios from "axios"
import { useSeesionStore } from "./session"
import { useUserStore } from "./user"

const apiURL = import.meta.env.VITE_API_URL

export const useAppStore = defineStore('app', () => {
  const sessionStore = useSeesionStore()
  const userStore = useUserStore()

  const api = ref({} as AxiosInstance)

  const user = ref({} as User)
  const users = ref([] as User[])
  const friends = ref([] as User[])
  const selectedFriend = ref({} as User)
  const thisFriend = ref({} as User)

  const channels = ref([] as Channel[])
  const selectedChannel = ref({} as Channel)
  const thisChannel = ref({} as Channel)

  const messages = ref([] as Message[]) // per channel
  const selectedMessage = ref({} as Message)
  const thisMessage = ref({} as Message)

  const secureStore = useSecureStore()
  const router = useRouter()

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

  const selectedMessages = computed(() => {
    return getMessagesByChannel(selectedChannel.value)
  }) // Store chat messages

  // Methods

  const initializeApiInstance = () => {
    api.value = axios.create({
      baseURL: `${apiURL}`,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  }

  const addInstanceHeader = (key: string, value: string): void => {
    api.value.defaults.headers[key] = value
  }

  const handleApiRequest = async (request: Promise<any>): Promise<{ status: string; data: any | string } | { status: string; error: string }> => {
    try {
      const response = await request
      const { status, message, data, error } = response.data

      if (status === HTTP_RESPONSE_STATUS.SUCCESS) {
        console.log(message, data) // Log both message and data
        response.status = status
        if (message) response.message = message
        if (data) response.data = data
        return response
      } else {
        console.error(`ERROR::: ${error}`)
        return { status, error }
      }
    } catch (error: any) {
      console.error(`@___ Request failed axios :: `, error.response.data)
      return error.response.data
    }
  }

  const setRandomUser = () => {
    user.value = friends.value[faker.number.int({ max: 9 })]
  }

  const setChannel = (payload?: Channel) => {
    console.log('Select Channel : ', payload)
    selectedChannel.value = payload ?? {} as Channel
    thisChannel.value = { ...payload ?? {} as Channel }
  }

  const setFriend = (payload: User) => {
    selectedFriend.value = payload
    thisFriend.value = { ...payload }
  }

  const getMessagesByChannel = (payload: Channel) => {
    return messages.value.filter(m => m.channel_uuid === payload.uuid)
  }

  const addChannel = (payload: Channel) => {
    channels.value.push(payload)
  }

  const addUser = async (payload: User) => {
    payload.password = await secureStore.hashPassword(payload.password)
    const _user = await userStore.addUser(payload)

    if (_user) {
      users.value.push(_user)
    }
    else {
      console.error('Add user failed')
    }
  }

  const mapBtnClick = () => {
    router.push({ name: 'map' })
  }

  const messagesBtnClick = () => {
    router.push({ name: 'chat' })
  }

  const getChannelByUser = (payload: User) => {

  }

  // Watchers
  // Scroll to the bottom whenever messages change
  watch(selectedMessages, (value, _) => {
    value.forEach(async (m, i) => {
      const res = await decryptMessage(m.message)
      decryptMessages.value[i] = res
    })
  })

  watch(selectedChannel, (value, _) => {
    if (value.uuid) {
      router.push({ name: 'chat', params: { uuid: value.uuid } })
    }
    else {
      router.push({ name: 'sidebar' })
    }
  })

  // Faker
  const _generateFriends = async (n: number) => {
    const firstUser = {
      uuid: faker.string.uuid(),
      fullname: 'user',
      email: 'user@gmail.com',
      password: await secureStore.hashPassword('user1'),
      created_on: faker.number.int({ min: 99999 })
    } as User

    users.value.push(firstUser)

    for (let index = 0; index < n; index++) {
      const newFriend = {
        uuid: faker.string.uuid(),
        fullname: faker.person.fullName(),
        email: faker.lorem.word() + "@gmail.com",
        password: await secureStore.hashPassword(faker.helpers.arrayElement(['mark1', 'andrew1', 'potot1'])),
        created_on: faker.number.int({ min: 99999 })
      } as User

      friends.value?.push(newFriend)
      users.value.push(newFriend)
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
    api,
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
    selectedMessages,
    users,
    thisFriend,
    initializeApiInstance,
    addInstanceHeader,
    handleApiRequest,
    encryptMessage,
    decryptMessage,
    setRandomUser,
    getMessagesByChannel,
    setChannel,
    setFriend,
    addChannel,
    addUser,
    mapBtnClick,
    messagesBtnClick,
    _generateFriends,
    _generateChannels,
    _generateMessage,
  }
})