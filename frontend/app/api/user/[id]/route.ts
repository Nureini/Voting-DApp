import { connectToDatabase } from '@/lib/mongodb/connectToDatabase'
import User from '@/lib/mongodb/models/User'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (request: NextRequest) => {
  // get the url, split it and retrieve the userId
  const url = request.url
  const splitUrl = url.split('/')
  const userId = splitUrl[splitUrl.length - 1]

  try {
    await connectToDatabase()

    const user = await User.findById(userId).lean()

    return NextResponse.json({
      status: 200,
      user,
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 500,
      message: `Error: ${error.message}`,
    })
  }
}
