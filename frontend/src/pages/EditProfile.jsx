import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../utils/userSlice";
import { Navigate, useNavigate } from "react-router-dom";
import useLoader from "../hooks/useLoader";

function EditProfile() {
  const dispatch = useDispatch();
  const {
    token,
    id: userId,
    name,
    email,
    username,
    profilePic,
    bio,
  } = useSelector((state) => state.user);

  const [userData, setUserData] = useState({
    profilePic,
    name,
    username,
    bio,
  });

  const [initialData, setInitialData] = useState({
    profilePic,
    name,
    username,
    bio,
  });

  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isLoading, startLoading, stopLoading] = useLoader();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, files, value } = e.target;
    if (files) {
      setUserData((prevData) => ({
        ...prevData,
        [name]: files[0],
      }));
    } else {
      setUserData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  }

  async function handleEditProfile() {
    startLoading();
    setIsButtonDisabled(true);
    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("username", userData.username);
    formData.append("bio", userData.bio);
    if (userData.profilePic) {
      formData.append("profilePic", userData.profilePic);
    }

    try {
      let res = await axios.patch(
        import.meta.env.VITE_BACKEND_URL + `/users/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      dispatch(login({ ...res.data.user, token, email, id: userId }));
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      stopLoading();
    }
  }

  useEffect(() => {
    if (initialData) {
      const isEqual = JSON.stringify(userData) === JSON.stringify(initialData);
      setIsButtonDisabled(isEqual);
    }
  }, [userData, initialData]);

  return token == null ? (
    <Navigate to={"/signin"} />
  ) : (
    <div className="w-full p-5">
      <div className="w-[80%] sm:w-[65%] md:w-[55%] lg:w-[45%] border mx-auto px-10">
        <h1 className="text-2xl font-semibold text-center">Edit Profile</h1>

        <div>
          <div className="">
            <h2 className="text-lg font-medium text-slate-700 my-2 opacity-80">
              Photo
            </h2>
            <div className="flex items-center flex-col w-full">
              <label htmlFor="image" className="w-32">
                {userData?.profilePic ? (
                  <img
                    src={
                      typeof userData.profilePic == "string"
                        ? userData.profilePic
                        : URL.createObjectURL(userData.profilePic)
                    }
                    alt=""
                    className="aspect-square object-cover border border-slate-300 rounded-full cursor-pointer"
                  />
                ) : (
                  <div className="w-32 aspect-square bg-white border-2 border-dashed border-slate-300 rounded-full opacity-50 flex justify-center items-center text-base cursor-pointer">
                    Select Image
                  </div>
                )}
              </label>
              <h2
                onClick={() => {
                  setUserData((prevData) => ({
                    ...prevData,
                    profilePic: null,
                  }));
                }}
                className="text-base font-medium text-red-500 my-2"
              >
                Remove
              </h2>
            </div>
            <input
              name="profilePic"
              className="hidden cursor-pointer w-32"
              id="image"
              type="file"
              accept=".png,.jpeg,.jpg"
              onChange={handleChange}
            />
          </div>
          <div className="my-4">
            <h2 className="text-lg font-medium text-slate-700 my-2 opacity-80">
              Name
            </h2>
            <input
              name="name"
              type="text"
              placeholder="Enter name"
              onChange={handleChange}
              defaultValue={userData.name}
              className="border text-base focus:outline-none rounded-lg w-full p-1 placeholder:text-base bg-white border-slate-300"
            />
          </div>

          <div className="my-4">
            <h2 className="text-lg font-medium text-slate-700 my-2 opacity-80">
              Username
            </h2>
            <input
              name="username"
              type="text"
              placeholder="Enter username"
              onChange={handleChange}
              defaultValue={userData.username}
              className="border text-base focus:outline-none rounded-lg w-full p-1 placeholder:text-base bg-white border-slate-300"
            />
          </div>

          <div className="my-4">
            <h2 className="text-lg font-medium text-slate-700 my-2 opacity-80">
              Bio
            </h2>
            <textarea
              name="bio"
              type="text"
              placeholder="Enter a bio"
              onChange={handleChange}
              defaultValue={userData.bio}
              className="h-[100px] resize-none rounded-lg text-base focus:outline-none border w-full p-1 placeholder:text-base bg-white border-slate-300"
            />
          </div>

          {!isLoading ? (
            <div>
              <button
                disabled={isButtonDisabled}
                onClick={handleEditProfile}
                className={
                  isButtonDisabled
                    ? "font-medium text-gray-400 bg-gray-300 my-4 px-3 py-2 rounded-lg cursor-not-allowed opacity-70"
                    : "font-medium text-white bg-black my-4 px-3 py-2 rounded-lg"
                }
              >
                Save
              </button>
              <button
                className={`mx-3 font-medium text-white bg-black my-4 px-3 py-2 rounded-lg`}
                onClick={() => navigate(-1)}
              >
                Back
              </button>
            </div>
          ) : (
            <span className="loader"></span>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
