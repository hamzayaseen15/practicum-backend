// const mongoose = require('mongoose')

// MONGODB_URI="mongodb://localhost:27017/society-v2"

// const initializeDatabaseConnection = () => {
//   // connect to MongoDB
//   mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })

//   const db = mongoose.connection

//   db.on('error', console.error.bind(console, 'connection error:'))

//   db.once('open', () => {
//     console.log('Successfully connected to MongoDB')
//   })
// }

// module.exports = initializeDatabaseConnection


const mongoose = require('mongoose');
// const mongoURI = "mongodb://localhost:27017"
const MONGODB_URI="mongodb://localhost:27017/society-v2"


const connectToMongo = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
      console.log(process.env.MONGODB_URI);
      console.error("Error connecting to MongoDB:", error.message);
    }
};
module.exports = connectToMongo