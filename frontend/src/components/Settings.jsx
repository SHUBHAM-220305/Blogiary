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

  return token == null ? (
    <Navigate to={"/signin"} />
  ) : (
    <div className="w-full p-5 md:w-[500px] flex flex-col items-center h-[calc(100vh_-_70px)] mx-auto justify-center">
      <h1 className="my-6 text-3xl font-bold">{!changePass ? "Settings" : "Change Password"}</h1>

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
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300
                      ${data.showSavedBlogs ? "bg-black" : "bg-gray-300"}`}
            >
              <span
                className={`h-4 w-4 bg-white rounded-full shadow-md transform transition-transform duration-300
                      ${data.showSavedBlogs ? "translate-x-6" : "translate-x-0"}`}
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
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300
                      ${data.showLikedBlogs ? "bg-black" : "bg-gray-300"}`}
            >
              <span
                className={`h-4 w-4 bg-white rounded-full shadow-md transform transition-transform duration-300
                      ${data.showLikedBlogs ? "translate-x-6" : "translate-x-0"}`}
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

          <p
            onClick={() => setChangePass(true)}
            className="text-lg font-medium cursor-pointer my-6 text-red-500 hover:underline"
          >
            Change Password
          </p>
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
