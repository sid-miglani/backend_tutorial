import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async ()=> {

    try{

        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error("MongoDB URI is not defined in .env file");
            // process.exit(1);
        }
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\nMongoDB connected!! DB HOST: ${connectionInstance.connection.host}`)
    }
    catch(error)
    {
        console.log("MongoDB Connection error", error);
        process.exit(1);
    }
} 

export default connectDB;