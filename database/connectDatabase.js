import mongoose from "mongoose";
import {DB_URI, NODE_ENV} from '../config/env.js' ; 

if(!DB_URI) {
    throw new Error(`please define the DB_URI in ${NODE_ENV}`) ; 
}

const connectToDatabase = async() => {
    try {
        await mongoose.connect(DB_URI) ; 
        console.log(`Connected to the Database in ${NODE_ENV} mode`) ; 
    } catch (error) {
        console.error('error connecting to the database ', error) ; 
    }
}

export default connectToDatabase ; 