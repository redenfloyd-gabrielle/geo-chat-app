import { defineStore } from "pinia"
import { useAppStore } from "./app"
import axios from 'axios'

export const useHelperStore = defineStore('helper', () => {
  const appStore = useAppStore()
  const apiURL = import.meta.env.VITE_API_URL

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.onerror = (error) => {
        reject(error)
      }
      reader.readAsDataURL(file)
    })
  }

  const uploadFile = async (f: File): Promise<string | undefined> => {
    try {
      // POST http://localhost:3000/api/v1/files/upload

      // {
      //   "status": "success",
      //     "message": "File uploaded successfully!",
      //       "data": {
      //     "filename": "b7ddda71-1faa-4dcb-9d1d-bec46fa5a20c.png",
      //       "file_path": "http://localhost:3000/uploads/b7ddda71-1faa-4dcb-9d1d-bec46fa5a20c.png"
      //   }
      // }


    const response = await appStore.handleApiRequest(appStore.api.post(`v1/files/upload`, { file: f }))

      if ('error' in response) {
        console.error(`@___ Error on adding channel :: ${response.error}`)
        return undefined
      }

      console.log(`@___ Added channel successfully ::`, response.data)
      return response.data?.file_path ?? undefined
    } catch (error) {
      console.error(`@___ Unexpected error on adding channel :: ${error}`)
      return undefined
    }
  }

  const uploadFileViaFormData = async (f: File): Promise<string | undefined> => {
    const formData = new FormData()
    formData.append('file', f) // Add the file with custom name

    // Send POST request with Axios
    const response = await axios.post(apiURL + `v1/files/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important: Set the correct content type for file upload
      }
    })

    if ('error' in response) {
      console.error(`@___ Error on uploading :: ${response.error}`)
      return undefined
    }

    console.log(`@___ uploading successfully ::`, response.data.data)
    return response.data.data?.file_path ?? undefined
  }

  return {
    uploadFile,
    uploadFileViaFormData
  }
})
