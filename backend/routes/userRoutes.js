const express = require('express');
const { createUser , getAllUsers , getUserById, updateUser, deleteUser, login, googleAuth, followUser, verifyEmail, changeSavedLikedBlogs, changePassword, forgotPassword, resetPassword } = require('../controllers/userController');
const verifyUser = require('../middlewares/auth');
const upload = require('../utils/multer');
const route = express.Router();

route.post("/signup", createUser);

route.post("/signin", login);

route.get("/users", getAllUsers);

route.get("/users/:username", getUserById);

route.patch("/users/:id", verifyUser, upload.single("profilePic"), updateUser);

route.delete("/users/:id", verifyUser, deleteUser);

route.get("/verify-email/:verificationToken", verifyEmail);

route.post("/google-auth", googleAuth);

route.patch("/follow/:id", verifyUser, followUser);

route.patch("/settings", verifyUser, changeSavedLikedBlogs);

route.patch("/change-password", verifyUser, changePassword);

route.post("/forgot-password", forgotPassword);
route.post("/reset-password/:token", resetPassword);

module.exports = route