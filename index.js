import express from 'express'
import connectDatabase from './config/db.js'
import cookieParser from 'cookie-parser';
import userRoute from './route/userRoute.js'
import { errorHandler } from './middleWare/errorHandler.js';
import cors from 'cors'
const PORT = process.env.PORT || 6000

const app = express();

app.use(express.json());

app.use(cors(
    {
     origin: 'http://localhost:5173',
    credentials: true
}
))

app.use(cookieParser());

app.use('/api/auth', userRoute );

app.use(errorHandler)

app.listen(PORT, () =>{
    connectDatabase()
    console.log(`port ${PORT} ready for connection`)
})
