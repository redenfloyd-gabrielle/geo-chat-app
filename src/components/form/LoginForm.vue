<template>
    <div class="login-form">
        <h2>Login</h2>
        <form @submit.prevent="handleLogin">
            <div class="form-group">
                <label for="email">Email</label>
                <input class="input-text-modal" id="email" type="email" v-model="email" placeholder="Enter your email"
                    required />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input class="input-text-modal" id="password" type="password" v-model="password"
                    placeholder="Enter your password" required />
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Login</button>
                <button type="button" class="btn btn-secondary" @click="goToSignup">Signup</button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { useAppStore } from '../../stores/app';
    import { LOGIN_STATUS } from '../../stores/types';

    // State for form inputs
    const email = ref('');
    const password = ref('');

    // Access router instance to navigate between routes
    const router = useRouter();
    const appStore = useAppStore()

    // Handle login logic
    const handleLogin = async () => {
        if (email.value && password.value) {
            console.log('Logging in with:', { email: email.value, password: password.value });
            // TODO: Add actual login logic, e.g., API call and session management

            const respond = await appStore.loginUser(email.value, password.value)

            if (respond == LOGIN_STATUS.SUCCESS) {
                router.push(`/${appStore.user.uuid}/chat`); // Example: Redirect to "/user_uuid"
            }
            else if (respond === LOGIN_STATUS.INVALID_PASSWORD) {
                alert(respond);
            }
            else {
                alert(respond);
            }

            // On successful login, navigate to user dashboard
        } else {
            alert('Please enter both email and password.');
        }
    };

    // Navigate to the Signup page
    const goToSignup = () => {
        router.push('/registration');
    };
</script>

<style scoped>
    .login-form {
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
        border: none;
        border-radius: 4px;
    }

    .btn-primary {
        background-color: #007bff;
        color: white;
    }

    .btn-secondary {
        background-color: #6c757d;
        color: white;
    }
</style>