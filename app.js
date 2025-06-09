import express, { urlencoded } from 'express' ; 
import { PORT } from './config/env.js';
//routes
import productsRouter from './routes/products.routes.js' ; 
import ordersRouter from './routes/order.router.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';

//database 
import connectToDatabase from './database/connectDatabase.js';

//middleware
import errorMiddleware from './middleware/error.middleware.js';
import { authorize } from './middleware/authorization.middleware.js';
import cors from 'cors'; 
import cookieParser from 'cookie-parser';

const app = express() ; 

app.use(cors()) ; 
app.use(express.json()) ; 
app.use(urlencoded({extended: false})) ; 
app.use(cookieParser()) ; 

app.use("/api/v1/products", productsRouter) ; 
app.use("/api/v1/orders", ordersRouter) ; 
app.use("/api/v1/auth", authRouter) ; 
app.use("/api/v1/users", userRouter) ; 

//middlewares 
app.use(errorMiddleware) ; 
app.use(authorize) ; 

app.get('/', (req, res) => {
    res.send('Welcome to the backend of the website!!! ') ; 
})

app.listen(PORT, async () => {
    console.log(`The server is listening to http:localhost:${PORT} !!!`) ; 
    await connectToDatabase() ; 
})

export default app ; 

// work-flow
// change the database's cluster to a new organised one for the e-com
// implement the middleware 
//complete the product API -> authentication API ->  USER API -> orders API ->