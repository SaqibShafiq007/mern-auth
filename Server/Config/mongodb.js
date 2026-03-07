import mongoose from "mongoose";

const connectDB = async ()=>{

    mongoose.connection.on('connected' , ()=> console.log("dbConnected"))

    await mongoose.connect(`${process.env.MONGODB_URI}/MERN_AUTH`)

};

export default connectDB