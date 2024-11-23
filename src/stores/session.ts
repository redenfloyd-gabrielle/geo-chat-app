import { defineStore } from "pinia";
import { ref, watch } from "vue";
import type { Session, User } from "./types";
import { useRouter } from "vue-router";
import { useChannelStore } from "./channel";
import { useAppStore } from "./app";
import { useUserStore } from "./user";

export const useSeesionStore = defineStore('session', () => {

    const session = ref<Session>()
    const router = useRouter()
    const channelStore = useChannelStore()
    const appStore = useAppStore()
    const userStore = useUserStore()

    const saveSession = (payload: Session) => {
        localStorage.setItem('session', JSON.stringify(payload))
        session.value = payload
    }

    const getSession = () => {
        console.log('Get Session in LocalStorage')
        const _session = localStorage.getItem('session') ?? ''

        if (_session) {
            session.value = JSON.parse(_session) as Session
            console.log('Get Session in LocalStorage', session.value)
        }
    }

    const deleteSession = () => {
        localStorage.removeItem('session')
        session.value = {} as Session
    }

    watch(session, async (value) => {
        if (value?.user) {
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
        }
    })

    return {
        session,
        saveSession,
        getSession,
        deleteSession
    }
})
