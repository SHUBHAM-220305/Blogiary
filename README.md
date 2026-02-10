# 📝 Blogiary

Blogiary is a full-stack blogging platform where users can create, publish, like, save, and manage blogs with secure authentication. It supports both email/password and Google authentication and provides a clean, modern writing and reading experience.

🌐 **Live Project**: https://blogiary.vercel.app/


## 🚀 Features

### Authentication
- Email & password authentication
- Google authentication using Firebase
- JWT-based authorization
- Forgot password & reset password flow
- Automatic logout after password change

### Blogging
- Create, edit, delete blogs
- Draft & publish support
- Rich text editor (EditorJS)
- Blog thumbnail image upload
- Inline image uploads inside blog content

### Social
- Like and unlike blogs
- Save blogs
- Follow and unfollow authors
- Followers and following system

### Profile & Settings
- User profile with bio and profile picture
- Privacy controls for liked and saved blogs
- Complete account deletion with data cleanup

### Media Handling
- Cloudinary for image storage
- Automatic deletion of images when blogs or users are deleted


## 🛠 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- EditorJS
- Firebase Authentication

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Authentication
- Firebase Admin SDK
- Cloudinary
- Multer

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Media Storage: Cloudinary


## 📂 Project Structure

```bash
blogiary/
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── utils/
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js


## 🔐 Security & Data Handling

- Passwords are hashed using bcrypt
- Protected routes using JWT authentication
- Firebase Admin SDK is used only on the backend
- MongoDB transactions prevent partial deletions
- No sensitive credentials are exposed on the frontend

### When a user deletes their account:
- All blogs created by the user are deleted
- Blog thumbnails and content images are removed from Cloudinary
- User is removed from followers and following lists
- Likes, saved blogs, and comments are cleaned up
- Firebase account is deleted for Google-authenticated users


## 🙌 Acknowledgements
- Firebase
- Cloudinary
- EditorJS
- MongoDB Atlas
- Render
- Vercel

## 📄 License
- This project is built for learning and portfolio purposes.