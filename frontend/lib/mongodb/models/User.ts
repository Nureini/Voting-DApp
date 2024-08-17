import { Schema, models, model } from 'mongoose'

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: { type: String, required: true },
  polygonAddress: { type: String, unique: true },
  admin: { type: Boolean, default: false },
  userValidIdMethod: { type: String },
  userImage: { type: String },
})

UserSchema.statics.checkForDuplicateUsername = async function (username) {
  const user = await this.findOne({ username })
  if (user) {
    return true
  }

  return false
}

UserSchema.statics.checkForDuplicateEmail = async function (email) {
  const user = await this.findOne({ email })
  if (user) {
    return true
  }

  return false
}

UserSchema.statics.checkForDuplicatePolygonAddress = async function (polygonAddress) {
  const user = await this.findOne({ polygonAddress })
  if (user) {
    return true
  }

  return false
}

const User = models.User || model('User', UserSchema)

export default User
