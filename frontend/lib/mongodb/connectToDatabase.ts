import mongoose from 'mongoose'

let isConnectedToDb = false

export const connectToDatabase = async () => {
  if (isConnectedToDb) return

  const MONGODB_URI = process.env.MONGODB_URI!

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'election-dApp',
    })

    isConnectedToDb = true
  } catch (error) {
    throw new Error(`Error: ${error}`)
  }
}
