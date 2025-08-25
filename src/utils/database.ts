import mongoose from 'mongoose'

const connectToDatabase = async () => {
  const DATABASE_URL = process.env.DATABASE_URL || ''

  try {
    mongoose.connect(DATABASE_URL)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }

  const dbConn = mongoose.connection
  dbConn.once('open', () => {
    console.log('Connected to MongoDB on ', DATABASE_URL)
  })

  dbConn.on('error', (err) => {
    console.log('Connection error', err)
  })
}

export default connectToDatabase
