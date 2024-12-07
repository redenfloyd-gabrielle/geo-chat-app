import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"
import type { Message, User, Channel, Session, Coordinates, _Marker, WebsocketMessage, Friend, Location } from "./types"
import { CHANNEL_TYPE, FRIENDSHIP_STATUS, HTTP_RESPONSE_STATUS, LOGIN_STATUS, WS_EVENT } from "./types"
import { faker } from "@faker-js/faker"
import { useSecureStore } from "./secure"
import { useRouter } from "vue-router"
import type { AxiosInstance } from "axios"
import axios from "axios"
import { useSeesionStore } from "./session"
import { useUserStore } from "./user"
import { useMessageStore } from "./message"
import { useChannelStore } from "./channel"
import { useWsStore } from "./ws"
import { useMapStore } from "./map"
import { useFriendshipStore } from "./friendship"
import { useLocationStore } from "./location"

const apiURL = import.meta.env.VITE_API_URL

export const useAppStore = defineStore('app', () => {
  const sessionStore = useSeesionStore()
  const userStore = useUserStore()
  const messageStore = useMessageStore()
  const channelStore = useChannelStore()
  const wsStore = useWsStore()
  const mapStore = useMapStore()
  const locationStore = useLocationStore()
  const friendshipStore = useFriendshipStore()

  const api = ref({} as AxiosInstance)

  const user = ref({} as User)
  const users = ref([] as User[])
  // const friends = ref([] as User[])
  const selectedFriend = ref({} as User)
  const thisFriend = ref({} as User)

  const channels = ref([] as Channel[])
  const selectedChannel = ref({} as Channel)
  const thisChannel = ref({} as Channel)

  const messages = ref([] as Message[]) // per channel
  const selectedMessages = ref([] as Message[]) // per channel
  const selectedMessage = ref({} as Message)
  const thisMessage = ref({} as Message)

  const secureStore = useSecureStore()
  const router = useRouter()

  const secretString = '3a7eca62-bdc6-44f0-8f3e-abf909c44cf7' // this should be moved to .env

  const decryptMessages = ref([] as string[])

  const isMapView = ref(false)

  // Computed Functions

  const getUserImage = computed(() => (uuid: string) => {
    return friends.value.find(f => f.uuid === uuid)?.image_url ?? '/get-chat-circle-logo.png'
  })

  const getUserFullname = computed(() => (uuid: string) => {
    return friends.value.find(f => f.uuid === uuid)?.fullname
  })

  const friends = computed(() => {
    // Extract full User objects from friendships involving the current user
    const friends = friendshipStore.friendships
      .filter(f => f.status === FRIENDSHIP_STATUS.Accepted)
      .map((friendship) => {
        if (friendship.user1_uuid === user.value.uuid) {
          return friendship.user2 // Return user2 object
        } else if (friendship.user2_uuid === user.value.uuid) {
          return friendship.user1 // Return user1 object
        }
        return null // Filter out friendships not involving the current user
      })
      .filter((user): user is User => user !== null) // Ensure no null values

    // Remove duplicates based on UUID
    const uniqueFriends = Array.from(
      new Map(friends.map((friend) => [friend.uuid, friend])).values()
    )

    return uniqueFriends
  })

  const friendshipRequestList = computed(() => {
    return friendshipStore.friendships.filter(f => f.status == FRIENDSHIP_STATUS.Pending) ?? [] as Friend[]
  })

  const groupChannels = computed(() => {
    return channels.value.filter(c => c.type === CHANNEL_TYPE.GROUP)
  })

  const encryptMessage = async (message: string) => {
    return await secureStore.encryptMessage(secretString, message)
  }

  const decryptMessage = async (message: string): Promise<string> => {
    const _message = secureStore.decryptMessage(secretString, message)
    return await _message
  }

  // Methods

  const initializeApiInstance = () => {
    api.value = axios.create({
      baseURL: `${apiURL}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('geo_chat_session') as string)?.token}`
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
    selectedChannel.value = payload as Channel
    thisChannel.value = payload as Channel
    mapStore.coordinates = [] as Coordinates[]
    mapStore.markers = [] as _Marker[]
    mapStore.thisCoordinates = {} as Coordinates
    locationStore.locations = [] as Location[]
    locationStore.thisLocation =  {}  as Location
  }

  const setFriend = (payload: User) => {
    selectedFriend.value = payload
    thisFriend.value = { ...payload }
  }

  const getMessagesByChannel = async (payload: Channel) => {
    return await messageStore.getMessageByChannel(payload.uuid)
  }

  const addMessage = async (payload: Message) => {
    const _message = await messageStore.addMessage(payload)
    if (_message) {
      const wsMessage = {
        event: WS_EVENT.MESSAGE,
        data: _message
      } as WebsocketMessage
      wsStore.sendMessage(wsMessage)
      // selectedMessages.value.push(_message)
    }
  }

  const addChannel = async (payload: Channel) => {
    if (payload.uuid) {
      const _channel = await channelStore.updateChannel(payload)
      if (_channel) {
        const index = channels.value.findIndex(channel => channel.uuid === payload.uuid)
        if (index !== -1) {
          channels.value[index] = _channel // Update the existing channel in the array
        } else {
          channels.value.push(_channel) // Add the channel if it wasn't found
        }
      } else {
        console.error('Update Channel failed')
      }
    } else {
      const _channel = await channelStore.addChannel(payload)
      if (_channel) {
        channels.value.push(_channel) // Add a new channel
      } else {
        console.error('Add Channel failed')
      }
    }
  }

  const addUser = async (payload: User) => {
    // payload.password = await secureStore.hashPassword(payload.password)
    const _user = await userStore.addUser(payload)

    if (_user) {
      router.push({ name: 'login' })
    }
    else {
      console.error('Add user failed')
    }
  }

  // Login function: Verify email and password
  const loginUser = async (username: string, password: string): Promise<LOGIN_STATUS> => {
    // auth/loing (email, password)
    const __user = await userStore.loginUser(username, password)

    console.log('__user __user', __user)

    if (__user) {
      console.log('Login successful:',)
      user.value = __user
      sessionStore.saveSession({ user: __user } as Session)
      return LOGIN_STATUS.SUCCESS
    }
    else {
      console.error('Invalid password')
      return LOGIN_STATUS.INVALID_PASSWORD
    }

    // users.value = await userStore.getUsers() ?? [] as User[]

    // const _user = users.value.find((user) => user.username === username);

    // if (!_user) {
    //   console.error('User not found');
    //   return LOGIN_STATUS.USER_NOT_FOUND;
    // }

    // const isPasswordValid = await secureStore.verifyPassword(password, _user.password);
    // if (isPasswordValid) {
    //   console.log('Login successful:', _user);
    //   user.value = _user
    //   sessionStore.saveSession({ user: _user } as Session)
    //   return LOGIN_STATUS.SUCCESS;
    // } else {
    //   console.error('Invalid password');
    //   return LOGIN_STATUS.INVALID_PASSWORD;
    // }
  }

  const logoutUser = async () => {
    sessionStore.deleteSession()
    user.value = {} as User
    // await router.push('/login')
    console.log('@__ window :: ', window, typeof window)
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  const clickUserBtn = () => {
    router.push({ name: 'user-detail' })
  }

  const mapBtnClick = () => {
    router.push({ name: 'map' })
  }

  const messagesBtnClick = () => {
    router.push({ name: 'chat' })
  }

  const updateFriendships = (payload: Friend) => {
    console.log('@@____ Update Friendship Request :: ', payload, friendshipStore.friendships)
    if (payload.user2_uuid === user.value.uuid || payload.user1_uuid === user.value.uuid) {
      const idx = friendshipStore.friendships.findIndex(f => f.uuid === payload.uuid)//(f.user1_uuid === user.value.uuid || f.user2_uuid === user.value.uuid) && (f.user1_uuid === payload.uuid || f.user2_uuid === payload.uuid))
      if (idx != -1) {
        friendshipStore.friendships[idx] = payload
      }
      else {
        friendshipStore.friendships.push(payload)
      }
    }
  }

  const removeFriendship = (payload: Friend) => {
    console.log('@@____ Update Friendship Request :: ', payload, friendshipStore.friendships)
    if (payload.user2_uuid === user.value.uuid || payload.user1_uuid === user.value.uuid) {
      const idx = friendshipStore.friendships.findIndex(f => f.uuid === payload.uuid)
      if (idx != -1) {
        friendshipStore.friendships.splice(idx, 1)
      }
    }
  }


  // Watchers
  // Scroll to the bottom whenever messages change
  watch(() => selectedMessages.value.length, (value, _) => {
    selectedMessages.value.forEach(async (m, i) => {
      const res = await decryptMessage(m.message)
      decryptMessages.value[i] = res
    })
  })

  watch(selectedChannel, async (value, _) => {
    if (_.uuid) {
      wsStore.leaveChannel(_.uuid)
    }

    if (value?.uuid) {
      if (value.type === CHANNEL_TYPE.GROUP) {
        setFriend({} as User)
      }

      // Get Messages per channel; Already implemented "const selectedMessages = computed(() => {"
      selectedMessages.value = await getMessagesByChannel(value) ?? [] as Message[]

      wsStore.joinChannel(value.uuid)

      router.push({ name: 'chat', params: { chat_uuid: value.uuid } })
    }
    else {
      router.push({ name: 'home', params: { uuid: user.value.uuid } })
    }
  })

  watch(selectedFriend, async (value) => {
    if (!value?.uuid) {
      return
    }

    const dmChannels = channels.value.filter(c => c.type === CHANNEL_TYPE.DIRECT_MESSAGE)

    // Look for the DM channel between the selected friend and the current user
    let existingChannel = dmChannels.find(channel => {
      const members = channel.user_uuids || [] // Ensure channel.members is defined
      return members.includes(value.uuid) && members.includes(user.value.uuid)
    })

    if (existingChannel) {
      console.log('Existing DM channel found:', existingChannel)
      // Perform actions with the existing channel if needed
      setChannel(existingChannel)
    } else {
      console.log('No DM channel found. You might want to create one.')
      // Logic to create a new DM channel or notify the user
      const newDMChannel = {} as Channel
      newDMChannel.uuid = ''
      newDMChannel.name = CHANNEL_TYPE.DIRECT_MESSAGE
      newDMChannel.type = CHANNEL_TYPE.DIRECT_MESSAGE
      newDMChannel.user_uuids = [value.uuid, user.value.uuid]
      newDMChannel.created_on = new Date().toISOString()

      existingChannel = await channelStore.addChannel(newDMChannel)
    }

    setChannel(existingChannel)
  })

  // Faker
  const _generateFriends = async (n: number) => {
    // const firstUser = {
    //   uuid: faker.string.uuid(),
    //   fullname: 'user',
    //   email: 'user@gmail.com',
    //   password: await secureStore.hashPassword('user1'),
    //   created_on: faker.number.int({ min: 99999 })
    // } as User

    // users.value.push(firstUser)

    // for (let index = 0; index < n; index++) {
    //   const newFriend = {
    //     uuid: faker.string.uuid(),
    //     fullname: faker.person.fullName(),
    //     email: faker.lorem.word() + "@gmail.com",
    //     password: await secureStore.hashPassword(faker.helpers.arrayElement(['mark1', 'andrew1', 'potot1'])),
    //     created_on: faker.number.int({ min: 99999 })
    //   } as User

    //   friends.value?.push(newFriend)
    //   users.value.push(newFriend)
    // }
  }

  const _generateChannels = (n: number) => {
    // for (let index = 0; index < n; index++) {
    //   const newChannel = {
    //     uuid: faker.string.uuid(),
    //     name: faker.vehicle.model(),
    //     user_uuids: friends.value.map(friend => friend.uuid),
    //     created_on: faker.number.int({ min: 99999 }),
    //   } as unknown as Channel

    //   channels.value?.push(newChannel)
    // }
  }

  const _generateMessage = async (n: number) => {
    // let _messages = [] as Message[]
    // for (let index = 0; index < n; index++) {
    //   const newMessage = {
    //     uuid: faker.string.uuid(),
    //     channel_uuid: faker.helpers.arrayElement(channels.value).uuid,
    //     user_uuid: faker.helpers.arrayElement(friends.value).uuid,
    //     message: await secureStore.encryptMessage(secretString, faker.lorem.paragraphs(2)),
    //     created_on: faker.number.int({ min: 99999 }),

    //   } as Message

    //   _messages.push(newMessage)
    // }

    // messages.value.push(..._messages)
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
    groupChannels,
    getUserImage,
    friendshipRequestList,
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
    addMessage,
    logoutUser,
    _generateFriends,
    _generateChannels,
    _generateMessage,
    clickUserBtn,
    updateFriendships,
    removeFriendship
  }
})