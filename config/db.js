import mongoose from "mongoose";

const uri = process.env.MONGO_URI

function connectDatabase(){
    mongoose.connect(uri)
    .then(() => console.log('mongodb connected'))
    .catch((err) => console.error(err))
}

export default connectDatabase