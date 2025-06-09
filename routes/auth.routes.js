import { Router } from "express";
import { signIn, signOut, signUp, GoogleSignIn, ForgotPassword, ResetPassword , adminLogin} from "../controllers/auth.controller.js";

const authRouter = Router() ; 

authRouter.post('/sign-up', signUp) ; 

authRouter.post('/sign-in', signIn) ; 

authRouter.get('/sign-out', signOut) ; 

//http://localhost:5500/api/v1/auth/google/callback
authRouter.post('/google-sign-in', GoogleSignIn) ; 

authRouter.post('/forgot-password', ForgotPassword);
authRouter.post('/reset-password', ResetPassword);

authRouter.post('/admin/login', adminLogin) ; 

export default authRouter ; 