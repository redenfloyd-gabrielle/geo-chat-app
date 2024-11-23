<template>
    <div class="user-form">
        <h2>{{ isEditMode ? 'Edit User' : 'Register User' }}</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="fullname">Full Name</label>
                <input class="input-text-modal" id="fullname" type="text" v-model="user.fullname"
                    placeholder="Enter full name" required />
            </div>

            <div class="form-group">
                <label for="fullname">Username</label>
                <input class="input-text-modal" id="fullname" type="text" v-model="user.username"
                    placeholder="Enter full name" required />
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input class="input-text-modal" id="email" type="email" v-model="user.email" placeholder="Enter email"
                    required />
            </div>

            <div v-if="!isEditMode" class="form-group">
                <label for="password">Password</label>
                <input class="input-text-modal" id="password" type="password" v-model="user.password"
                    placeholder="Enter password" required />
            </div>

            <div v-if="!isEditMode" class="form-group">
                <label for="password">Confirm Password</label>
                <input class="input-text-modal" id="confirmp-password" type="password" v-model="confirmPassword"
                    placeholder="Enter password" required />
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary" :disabled="isPasswordMatched">
                    {{ isEditMode ? 'Update User' : 'Register User' }}
                </button>
                <button type="button" class="btn btn-secondary" @click="cancel">
                    Cancel
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
    import { ref, defineEmits, watch, computed } from 'vue';
    import type { User } from '../../stores/types'; // Adjust path to your User interface
    import { useRoute, useRouter } from 'vue-router';
    import { useAppStore } from '../../stores/app';

    // Props to receive user data (optional for edit mode)
    const props = defineProps<{
        initialUser?: User;
    }>();

    const router = useRouter()
    const route = useRoute()
    const appStore = useAppStore()

    const confirmPassword = ref('')

    // Emit events to notify parent component of actions
    const emit = defineEmits(['submit', 'cancel']);

    const isEditMode = ref(!!props.initialUser); // Determine if it's edit mode or registration

    // Initialize user state
    const user = ref<User>({
        uuid: props.initialUser?.uuid || '',
        fullname: props.initialUser?.fullname || '',
        username: props.initialUser?.username || '',
        email: props.initialUser?.email || '',
        password: '',
        created_on: props.initialUser?.created_on || Date.now(),
    });

    const isPasswordMatched = computed(() => {
        return confirmPassword.value === user.value.password && user.value.password.length > 1
    })

    // Watch for changes in the props.initialUser prop to update the form (for editing)
    watch(
        () => props.initialUser,
        (newUser) => {
            if (newUser) {
                user.value = { ...newUser, password: '' }; // Clear password field on edit
                isEditMode.value = true;
            }
            console.log('initial User', props.initialUser)
        }
    );

    // Handle form submission
    const handleSubmit = () => {
        if (route.fullPath.includes('registration')) {
            appStore.addUser(user.value)
        }
        else {
            // Update User
            emit('submit', { ...user.value }); // Send user data to parent component
        }
    };

    // Handle cancel action
    const cancel = () => {
        if (route.fullPath.includes('registration')) {
            router.push('/')
        }
        else {
            //Close 
            emit('cancel');

        }
    };
</script>

<style scoped>
    .user-form {
        max-width: 400px;
        margin: auto;
        padding: 2rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-actions {
        display: flex;
        justify-content: space-between;
    }

    .btn {
        padding: 0.5rem 1rem;
        cursor: pointer;
    }

    .btn-primary {
        background-color: #007bff;
        color: white;
        border: none;
    }

    .btn-secondary {
        background-color: #6c757d;
        color: white;
        border: none;
    }
</style>