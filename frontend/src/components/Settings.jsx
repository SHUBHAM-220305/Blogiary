import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { updateData } from "../utils/userSlice";
import ChangePassword from "./ChangePassword";

function Settings() {
  const { token, showLikedBlogs, showSavedBlogs } = useSelector(
    (state) => state.user,
  );

  const [data, setData] = useState({ showLikedBlogs, showSavedBlogs });
  const [changePass, setChangePass] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleSettings() {
    try {
      let res = await axios.patch(
        import.meta.env.VITE_BACKEND_URL + "/settings",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      dispatch(updateData(res.data));
      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  async function handleDeleteProfile() {
    try {
      const res = await axios.delete(
        import.meta.env.VITE_BACKEND_URL + `/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(res.data.message);
      dispatch(updateData(null));
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setShowDeleteModal(false);
    }
  }

  return token == null ? (
    <Navigate to={"/signin"} />
  ) : (
    <div className="w-full p-5 md:w-[500px] flex flex-col items-center h-[calc(100vh_-_70px)] mx-auto justify-center">
      <h1 className="my-6 text-3xl font-bold">
        {!changePass ? "Settings" : "Change Password"}
      </h1>

      {!changePass ? (
        <>
          <div className="my-4 flex gap-6 items-center">
            <h2 className="text-2xl font-semibold my-2">Show Saved Blogs?</h2>
            <button
              onClick={() =>
                setData((prev) => ({
                  ...prev,
                  showSavedBlogs: !prev.showSavedBlogs,
                }))
              }
              className={`flex items-center rounded-full p-1 transition-colors duration-300
          ${data.showSavedBlogs ? "bg-black" : "bg-gray-300"}
          w-10 h-5 sm:w-12 sm:h-6`}
            >
              <span
                className={`bg-white rounded-full shadow-md w-4 h-4 transform transition-transform duration-300
          ${data.showSavedBlogs ? "translate-x-2 sm:translate-x-6" : "translate-x-0"}`}
              />
            </button>

            <span className="text-sm opacity-70">
              {data.showSavedBlogs ? "Show" : "Don't Show"}
            </span>
          </div>

          <div className="my-4 flex gap-6 items-center">
            <h2 className="text-2xl font-semibold my-2">Show Liked Blogs?</h2>
            <button
              onClick={() =>
                setData((prev) => ({
                  ...prev,
                  showLikedBlogs: !prev.showLikedBlogs,
                }))
              }
              className={`flex items-center rounded-full p-1 transition-colors duration-300
          ${data.showLikedBlogs ? "bg-black" : "bg-gray-300"}
          w-10 h-5 sm:w-12 sm:h-6`}
            >
              <span
                className={`bg-white rounded-full shadow-md w-4 h-4 transform transition-transform duration-300
          ${data.showLikedBlogs ? "translate-x-2 sm:translate-x-6" : "translate-x-0"}`}
              />
            </button>

            <span className="text-sm opacity-70">
              {data.showLikedBlogs ? "Show" : "Don't Show"}
            </span>
          </div>

          <button
            className="text-white text-lg p-2 px-7 rounded-lg font-semibold focus:outline-none bg-black"
            onClick={handleSettings}
          >
            Update
          </button>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
            <p
              onClick={() => setChangePass(true)}
              className="text-lg font-medium cursor-pointer my-6 text-red-500 hover:underline"
            >
              Change Password
            </p>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-white text-lg p-2 px-7 rounded-lg font-semibold focus:outline-none bg-red-600 hover:bg-red-700"
            >
              Delete Profile
            </button>
          </div>

          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-[300px]">
                <h2 className="font-semibold text-lg mb-3">
                  Are you sure you want to delete your profile?
                </h2>
                <p className="text-sm text-gray-600 mb-5">
                  This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-3 py-1 rounded-md border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProfile}
                    className="px-3 py-1 rounded-md bg-red-600 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <ChangePassword setChangePass={setChangePass} />
          <button
            onClick={() => setChangePass(false)}
            className="text-sm hover:underline my-5 text-red-500"
          >
            ← Back to Settings
          </button>
        </>
      )}
    </div>
  );
}

export default Settings;
