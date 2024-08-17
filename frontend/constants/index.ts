export const API_ENDPOINT_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://0xdemocracy.vercel.app/api'
    : 'http://localhost:3000/api'
