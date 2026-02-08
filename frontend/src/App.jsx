import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import AuthForm from "./pages/AuthForm";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import AddBlog from "./pages/AddBlog";
import BlogPage from "./pages/BlogPage";
import VerifyUser from "./components/VerifyUser";
import ProfilePage from "./pages/ProfilePage";
import EditProfile from "./pages/EditProfile";
import Search from "./components/Search";
import Settings from "./components/settings";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navbar />}>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/signin" element={<AuthForm type={"signin"} />}></Route>
        <Route path="/signup" element={<AuthForm type={"signup"} />}></Route>
        <Route path="/add-blog" element={<AddBlog />}></Route>
        <Route path="/blog/:id" element={<BlogPage />}></Route>
        <Route path="/edit/:id" element={<AddBlog />}></Route>
        <Route path="/search" element={<Search />}></Route>
        <Route path="/tag/:tag" element={<Search />}></Route>
        <Route
          path="/verify-email/:verificationToken"
          element={<VerifyUser />}
        ></Route>
        <Route path="/:username" element={<ProfilePage />}></Route>
        <Route path="/:username/saved-blogs" element={<ProfilePage />}></Route>
        <Route path="/:username/liked-blogs" element={<ProfilePage />}></Route>
        <Route path="/:username/drafts" element={<ProfilePage />}></Route>
        <Route path="/edit-profile" element={<EditProfile />}></Route>
        <Route path="/settings" element={<Settings />}></Route>
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>
        <Route path="/reset-password/:token" element={<ResetPassword />}></Route>
      </Route>
    </Routes>
  );
}

export default App;
