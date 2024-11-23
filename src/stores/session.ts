import { defineStore } from "pinia";
import { ref, watch } from "vue";
import type { Session } from "./types";
import { useRouter } from "vue-router";

export const useSeesionStore = defineStore('session', () => {

    const session = ref<Session>()
    const router = useRouter()

    const saveSession = (payload: Session) => {
        localStorage.setItem('session', JSON.stringify(payload))
        session.value = payload
    }

    const getSession = () => {
        const _session = localStorage.getItem('session') ?? {} as Session

        session.value = _session as Session
    }

    const deleteSession = () => {
        localStorage.removeItem('session')
        session.value = {} as Session
    }

    watch(session, (value) => {
        if (value?.user) {
            router.push({ name: 'home', params: { uuid: session.value?.user.uuid } })
        }
    })

    return {
        session,
        saveSession,
        getSession,
        deleteSession
    }
})
