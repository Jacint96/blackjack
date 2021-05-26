import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  created: Number,
  name: String,
  email: String,
  password: String,
  balance: Number,
  token: String,
})

export default mongoose.model('user', userSchema)
