import { Router } from "express";
import { getAllUsers, getUser, updateUser, deleteUser } from "../controllers/user.controller.js";
import { authorize } from "../middleware/authorization.middleware.js";

const userRouter = Router() ; 

userRouter.get('/', getAllUsers) ; 

userRouter.get('/:id', authorize, getUser) ; 

userRouter.put('/:id', authorize,  updateUser) ; 

userRouter.delete('/:id', authorize, deleteUser) ; 

export default userRouter ; 