import { defineStore } from "pinia"
import { ref, watch } from "vue"
import { HTTP_RESPONSE_STATUS, LOGIN_STATUS, type Friend, type Session, type User } from "./types"
import { useRouter } from "vue-router"
import { useAuthStore } from "./auth"
import { useUserStore } from "./user"
import { useAppStore } from "./app"
import dayjs from "dayjs"
import { useChannelStore } from "./channel"
import { useFriendshipStore } from "./friendship"

export const useSeesionStore = defineStore('session', () => {

  const session = ref<Session>()
  const authStore = useAuthStore()

  const router = useRouter()
  const channelStore = useChannelStore()
  const appStore = useAppStore()
  const userStore = useUserStore()
  const friendshipStore = useFriendshipStore()

  const loginUser = async (username: string, password: string): Promise<LOGIN_STATUS> => {
    // auth/loing (email, password)
    const response = await authStore.login(username, password)

    console.log('@___ Login response _user :: ', response)

    if (response && 'status' in response) {
      const errorStatus = response.error as string

      // Check if errorStatus exists in LOGIN_STATUS enum and return the exact type
      if (Object.values(LOGIN_STATUS).includes(errorStatus as LOGIN_STATUS)) {
        return errorStatus as LOGIN_STATUS  // Return the exact type from the enum
      } else {
        return LOGIN_STATUS.INVALID_PASSWORD  // Return a default or fallback value if not valid
      }
    } else {
      const _user = response as any
      console.log('@___ Login successful! ')
      userStore.selecteUser = _user.user as User
      userStore.thisUser = _user.user as User
      appStore.user = _user.user as User
      appStore.addInstanceHeader('Authorization', `Bearer ${_user.token as string}`)
      saveSession({ user: { ...userStore.selecteUser } as User, token: _user.token as string } as Session)
      return LOGIN_STATUS.SUCCESS
    }
  }

  const logoutUser = async () => {
    deleteSession()
    userStore.selecteUser = {} as User
    userStore.thisUser = {} as User
    await router.push({ name: 'login' })
    window.location.reload()
  }

  const reevaluateAuthSession = async (session: Session) => {
    console.log('@___ reevaluateAuthSession', session)
    debugger
    if (session.token) {
      const response = await authStore.validateToken()
      console.log('@___ validateAccessToken response ...', response)
      if (response && 'status' in response && response.status === HTTP_RESPONSE_STATUS.FAIL) {
        logoutUser()
        //renew
      } else if (response && 'exp' in response) {
        console.log("@___ Access token is still valid :: (response)", response)
        const currentDate = dayjs() // t1
        const expiryDate = dayjs.unix(response.exp as number) // t2

        console.log(`@___ decoded.exp :: ${expiryDate} \n currentEpoch :: ${currentDate} \n diff:: ${expiryDate.diff(currentDate, 'minutes')}`)
        const minutesDiff = expiryDate.diff(currentDate, 'minutes')
        if (minutesDiff < 10) {
          const tokenResponse = await authStore.renewToken()
          if (tokenResponse && typeof tokenResponse !== 'string') {
            logoutUser()
          } else {
            saveSession({ user: { ...userStore.selecteUser } as User, token: tokenResponse as string } as Session)
          }

        }
      } else {
        logoutUser()
      }


    }
  }

  watch(session, async (value) => {
    if (!value || Object.keys(value).length === 0) {
      return
    }
    if (value?.user) {
      // Assign existing token
      appStore.addInstanceHeader('Authorization', `Bearer ${value.token as string}`)

      // Validate USER
      const _user = session.value?.user ?? {} as User
      appStore.user = await userStore.getUserByUuid(_user) ?? {} as User

      if (!appStore.user) {
        console.error('User not valid')
        appStore.logoutUser()
      }

      const user_uuid = appStore.user.uuid ?? ''
      router.push({ name: 'home', params: { uuid: user_uuid } })

      // appStore._generateFriends(100)
      // appStore._generateChannels(5)
      // appStore._generateMessage(20)
      // appStore.setRandomUser()
      // setTimeout(() => {
      //   console.log('appStore.channels[0', appStore.channels[0])
      //   const channel = appStore.channels[0]
      //   appStore.setChannel(channel)
      // }, 500);

      // Get Channels by user_uuid
      console.log('Get Channel per User')
      const channels_user_uuid = await channelStore.getChannelsByUser(user_uuid)
      if (channels_user_uuid) {
        appStore.channels = channels_user_uuid
        channelStore.channels = channels_user_uuid
      }

      // Get Friends by user_uuid
      friendshipStore.friendships = await friendshipStore.getFriendByUserUuid(_user.uuid) ?? [] as Friend[]

    }
    else {
      logoutUser()
    }

  })

  const saveSession = (payload: Session) => {
    localStorage.setItem('geo_chat_session', JSON.stringify(payload))
    session.value = payload
  }

  const getSession = (): Session | null => {
    console.log('Get Session')
    const _session = localStorage.getItem('geo_chat_session')
    if (_session) {
      const __session = JSON.parse(_session) as Session
      return __session
    } else {
      return null
    }
  }

  const deleteSession = () => {
    localStorage.removeItem('geo_chat_session')
    session.value = {} as Session
  }

  return {
    session,
    loginUser,
    logoutUser,
    reevaluateAuthSession,
    saveSession,
    getSession,
    deleteSession
  }
})
