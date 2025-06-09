import User from "../models/user.model.js";

export const getAllUsers = (req, res) => {
    res.send('got all users') ; 
}

export const getUser = (req, res) => {
    res.send('got user') ; 
}

export const updateUser = (req, res) => {
    res.send('user updated') ; 
}

export const deleteUser = (req, res) => {
    res.send('user deleted') ; 
}

