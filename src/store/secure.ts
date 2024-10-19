import { defineStore } from "pinia";
import bcrypt from 'bcryptjs';

// Storing Chat Messages and Passwords Securely
// For Chat Messages (Encryption):

// Encrypt chat messages before saving them to your database.
// Use a unique Initialization Vector (IV) per message to ensure that identical messages generate different encrypted values.
// Decrypt them only when you need to display them to the user.

// For Passwords (Hashing Instead of Encryption):
// Do not encrypt passwords. Use hashing with a function like bcrypt, Argon2, or PBKDF2 instead.
// Reason: Encryption can be reversed (decrypted), while hashing is a one-way function, making it better for password storage.

export const useSecureStore = defineStore('secure', () => {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const SALT_ROUNDS = 10; // Higher number increases security but also CPU time

    // // Helper: Convert string to Uint8Array
    // function stringToUint8Array(str: string): Uint8Array {
    //     return new TextEncoder().encode(str);
    // }

    // // Helper: Convert Uint8Array to string
    // function uint8ArrayToString(arr: Uint8Array): string {
    //     return new TextDecoder().decode(arr);
    // }

    // // Generate CryptoKey from secret
    // const generateKey = async (secret: string): Promise<CryptoKey> => {
    //     const keyBytes = stringToUint8Array(secret.padEnd(32, '0')).slice(0, 32); // Ensure key is 32 bytes (256-bit)
    //     return crypto.subtle.importKey(
    //         'raw',
    //         keyBytes,
    //         { name: 'AES-GCM' },
    //         false,
    //         ['encrypt', 'decrypt']
    //     );
    // }

    // // Encrypt Chat Message
    // const encryptMessage = async (secret: string, message: string): Promise<ArrayBuffer> => {
    //     const key = await generateKey(secret)
    //     const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV for AES-GCM
    //     const encrypted = await crypto.subtle.encrypt(
    //         { name: 'AES-GCM', iv },
    //         key,
    //         stringToUint8Array(message)
    //     );

    //     // Combine IV and encrypted data into a single buffer
    //     const combined = new Uint8Array(iv.length + encrypted.byteLength);
    //     combined.set(iv, 0);
    //     combined.set(new Uint8Array(encrypted), iv.length);
    //     return combined.buffer;
    // }

    // // Decrypt Chat Message
    // const decryptMessage = async (secret: string, ciphertext: ArrayBuffer): Promise<string> => {
    //     const key = await generateKey(secret)
    //     const combined = new Uint8Array(ciphertext);
    //     const iv = combined.slice(0, 12); // Extract IV from the beginning
    //     const encryptedData = combined.slice(12); // Extract encrypted message

    //     const decrypted = await crypto.subtle.decrypt(
    //         { name: 'AES-GCM', iv },
    //         key,
    //         encryptedData
    //     );
    //     return uint8ArrayToString(new Uint8Array(decrypted));
    // }

    // Helper: Convert Uint8Array to Base64 string
    function uint8ArrayToBase64(arr: Uint8Array): string {
        return btoa(String.fromCharCode(...arr));
    }

    // Helper: Convert Base64 string to Uint8Array
    function base64ToUint8Array(base64: string): Uint8Array {
        const binary = atob(base64);
        return new Uint8Array([...binary].map((char) => char.charCodeAt(0)));
    }

    // Encrypt Chat Message and return as Base64 string
    const encryptMessage = async (secret: string, message: string): Promise<string> => {
        const key = await generateKey(secret);
        const iv = crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for AES-GCM

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            stringToUint8Array(message)
        );

        // Combine IV and encrypted data into a single buffer
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);

        // Convert the combined buffer to Base64 and return as string
        return uint8ArrayToBase64(combined);
    };

    // Decrypt Base64-encoded Chat Message
    const decryptMessage = async (secret: string, ciphertext: string): Promise<string> => {
        const key = await generateKey(secret);
        const combined = base64ToUint8Array(ciphertext); // Decode Base64 to Uint8Array

        const iv = combined.slice(0, 12); // Extract IV from the beginning
        const encryptedData = combined.slice(12); // Extract encrypted message

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encryptedData
        );

        return uint8ArrayToString(new Uint8Array(decrypted));
    };

    // Helper: Convert string to Uint8Array
    function stringToUint8Array(str: string): Uint8Array {
        return new TextEncoder().encode(str);
    }

    // Helper: Convert Uint8Array to string
    function uint8ArrayToString(arr: Uint8Array): string {
        return new TextDecoder().decode(arr);
    }

    // Generate AES Key (128-bit or 256-bit)
    async function generateKey(secret: string): Promise<CryptoKey> {
        const keyBytes = stringToUint8Array(secret.padEnd(32, '0')).slice(0, 32); // Ensure 256-bit key
        return crypto.subtle.importKey(
            'raw',
            keyBytes,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
        );
    }

    const hashPassword = async (password: string): Promise<string> => {
        return await bcrypt.hash(password, SALT_ROUNDS);
    }

    const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
        return await bcrypt.compare(password, hashedPassword);
    }

    return {
        encryptMessage,
        decryptMessage,
        hashPassword,
        verifyPassword
    }
})