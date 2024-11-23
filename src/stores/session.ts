import { defineStore } from "pinia";
import { ref } from "vue";
import type { Session } from "./types";

export const useSeesionStore = defineStore('session', () => {

    const session = ref<Session>()

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

    return {
        session,
        saveSession,
        getSession,
        deleteSession
    }
})
