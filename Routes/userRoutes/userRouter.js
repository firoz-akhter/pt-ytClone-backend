import express from "express";
import {
  changePassword,
  deleteAccount,
  forgotPassword,
  getUserProfile,
  Login_user,
  logout,
  register_User,
  resetPassword,
  resetPasswordLink,
  updateUserProfile,
} from "../../Controllers/userController.js";
import { upload } from "../../MiddleWare/MulterMiddleWare.js";
import { isAuthenticated } from "../../MiddleWare/isAuthenticated.js";
const route = express.Router();

route.post("/register", upload.single("avatar"), register_User);
route.post("/login", Login_user);
route.get("/logout", logout);
route.get("/getUserProfile", isAuthenticated, getUserProfile);
route.patch("/updateUserProfile", isAuthenticated, updateUserProfile);
route.patch("/changePassword", isAuthenticated, changePassword);
route.delete("/deleteAccount", isAuthenticated, deleteAccount);
route.post("/forgotPassword", forgotPassword);
route.get("/reset-password/:token", resetPasswordLink);
route.post("/reset-password/:token", resetPassword);

export default route;
