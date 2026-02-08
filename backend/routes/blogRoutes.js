const express = require('express');
const { createBlog , getBlogs , getBlog , updateBlog , deleteBlog, likeBlog, saveBlog, searchBlogs, getTopTags } = require('../controllers/blogController');
const { commentBlog, deleteComment, editComment, likeComment, addNestedComment } = require('../controllers/commentController');
const verifyUser = require('../middlewares/auth');
const upload = require('../utils/multer');
const route = express.Router();

//blog
route.post("/blogs", verifyUser, upload.fields([{ name: "image", maxCount: 1 }, { name: "images" }]), createBlog);
route.get("/blogs", getBlogs);
route.get("/blogs/:blogId", getBlog);
route.patch("/blogs/:id", verifyUser, upload.fields([{ name: "image", maxCount: 1 }, { name: "images" }]), updateBlog);
route.delete("/blogs/:id", verifyUser, deleteBlog);

//like
route.post("/blogs/like/:id", verifyUser, likeBlog);

//comment
route.post("/blogs/comment/:id", verifyUser, commentBlog);
route.delete("/blogs/comment/:id", verifyUser, deleteComment);
route.patch("/blogs/comment/:id", verifyUser, editComment);
route.patch("/blogs/like-comment/:id", verifyUser, likeComment);

//nested comment
route.post("/comment/:parentCommentId/:id", verifyUser, addNestedComment);

route.patch("/save-blog/:id", verifyUser, saveBlog);

route.get("/search-blogs", searchBlogs);

route.get("/tags/top", getTopTags);

module.exports = route;