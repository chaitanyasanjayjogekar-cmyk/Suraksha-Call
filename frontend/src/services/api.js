import axios from 'axios'

const API_BASE = '/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.detail || err.message || 'Network error'
    return Promise.reject(new Error(message))
  }
)

export const checkHealth = () => api.get('/health')

export const uploadAudio = (file, onProgress) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/upload-audio', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    },
  })
}

export const analyzeTranscript = (transcript) =>
  api.post('/analyze-audio', { transcript })

export const runDemo = (demoType) =>
  api.post(`/demo/${demoType}`)

export const generateWarning = () =>
  api.post('/generate-warning', { transcript: '' })

export const getRecentAnalyses = () =>
  api.get('/recent-analyses')

export default api
