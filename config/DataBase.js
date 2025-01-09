import mongoose from "mongoose";

const CONNECT_DB = async()=>{
    await mongoose.connect(process.env.MONGO_URL).then(()=>{
        console.log("DataBase is Connected")
    }).catch((err)=>{
        console.log("Server Error" , err)
    })
}

export default CONNECT_DB;