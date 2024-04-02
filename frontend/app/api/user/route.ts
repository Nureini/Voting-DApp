import { connectToDatabase } from '@/lib/mongodb/connectToDatabase'
import User from '@/lib/mongodb/models/User'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

// Created for Admin to return all users
export const GET = async (request: NextRequest) => {
  try {
    await connectToDatabase()

    const users = await User.find({}).lean()

    return NextResponse.json({
      status: 200,
      users,
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 500,
      message: `Error: ${error.message}`,
    })
  }
}

// POST method for creating a new user
export const POST = async (request: NextRequest) => {
  const { username, email, password } = await request.json()

  if (!username || !email || !password) {
    return NextResponse.json({
      status: 400,
      message: 'All fields are required!',
    })
  }

  try {
    await connectToDatabase()

    const duplicateUsername = await User.findOne({
      username: username.toLowerCase(),
    })
      .lean()
      .exec()
    if (duplicateUsername) {
      return NextResponse.json({
        status: 409,
        message: 'Username chosen already exists',
      })
    }

    const duplicateEmail = await User.findOne({ email: email.toLowerCase() })
      .lean()
      .exec()
    if (duplicateEmail) {
      return NextResponse.json({
        status: 409,
        message: 'An account with this email already exists',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
    })

    return NextResponse.json({
      status: 200,
      message: 'Succesfully created new user',
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 500,
      message: `Error: ${error.message}`,
    })
  }
}

// PATCH method for updating user details
export const PATCH = async (request: NextRequest) => {
  const {
    id,
    username,
    email,
    password,
    polygonAddress,
    userValidIdMethod,
    userImage
  } = await request.json()

  if (!id) {
    return NextResponse.json({
      status: 400,
      message: 'User ID has not been provided',
    })
  }

  try {
    await connectToDatabase()

    const findUser = await User.findById(id).exec()

    if (username) {
      const duplicateUsername = await User.findOne({
        username: username.toLowerCase(),
        _id: { $ne: id },
      })
        .lean()
        .exec()
      if (duplicateUsername) {
        return NextResponse.json({
          status: 409,
          message: 'Username chosen already exists',
        })
      }
      findUser.username = username.toLowerCase()
    }

    if (email) {
      const duplicateEmail = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id },
      })
        .lean()
        .exec()
      if (duplicateEmail) {
        return NextResponse.json({
          status: 409,
          message: 'An account with this email already exists',
        })
      }
      findUser.email = email.toLowerCase()
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      findUser.password = hashedPassword
    }

    if (polygonAddress) {
      const duplicatePolygonAddress = await User.findOne({
        polygonAddress: polygonAddress.toLowerCase(),
        _id: { $ne: id },
      })
        .lean()
        .exec()
      if (duplicatePolygonAddress) {
        return NextResponse.json({
          status: 409,
          message:
            'An account has already been linked to this Polygon Address',
        })
      }
      findUser.polygonAddress = polygonAddress.toLowerCase()
    }

    findUser.userValidIdMethod = userValidIdMethod || ''
    findUser.userImage = userImage || ''

    await findUser.save()

    return NextResponse.json({
      status: 200,
      message: 'Succesfully updated user',
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 500,
      message: `Error: ${error.message}`,
    })
  }
}

// DELETE method to delete a user
export const DELETE = async (request: NextRequest) => {
  const { id } = await request.json()

  if (!id) {
    return NextResponse.json({
      status: 400,
      message: 'User ID has not been provided',
    })
  }

  try {
    await connectToDatabase()

    await User.findByIdAndDelete(id)

    return NextResponse.json({
      status: 204,
      message: 'Succesfully deleted user',
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 500,
      message: `Error: ${error.message}`,
    })
  }
}
