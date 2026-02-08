import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../utils/userSlice";
import Input from "../components/Input";
import { googleAuth } from "../utils/firebase";

function AuthForm({ type }) {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleAuthForm(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL + `/${type}`,
        userData,
      );

      if (type == "signup") {
        toast.success(res.data.message);
        navigate("/signin");
      } else {
        dispatch(login(res.data.user));
        toast.success(res.data.message);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
      setUserData({ name: "", email: "", password: "" });
    }
  }

  async function handleGoogleAuth() {
    try {
      let data = await googleAuth();
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL + `/google-auth`,
        { accessToken: data.user.accessToken },
      );
      dispatch(login(res.data.user));
      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  }

  return (
    <div className="w-full h-[calc(100vh_-_100px)] flex items-center p-4 justify-center">
      <div className="bg-gray-100 flex flex-col items-center p-4 max-w-[350px] gap-5 mt-24 sm:mt-44 mx-auto rounded-md">
        <h1 className="text-xl sm:text-3xl font-medium">
          {type == "signin" ? "Sign In" : "Sign Up"}
        </h1>
        <form
          onSubmit={handleAuthForm}
          className="w-[100%] flex flex-col items-center gap-5"
        >
          {type == "signup" && (
            <Input
              type={"text"}
              placeholder={"Name"}
              setUserData={setUserData}
              changedField={"name"}
              value={userData.name}
              icon={"fi-br-user"}
            />
          )}

          <Input
            type={"email"}
            placeholder={"Email"}
            setUserData={setUserData}
            changedField={"email"}
            value={userData.email}
            icon={"fi-br-at"}
          />

          <Input
            type={"password"}
            placeholder={"Password"}
            setUserData={setUserData}
            changedField={"password"}
            value={userData.password}
            icon={"fi-br-lock"}
          />

          {type == "signin" && (
            <p
              className="text-base text-blue-600 cursor-pointer"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </p>
          )}

          <button
            className={`w-[50%] h-[35px] sm:h-[50px] text-center text-white text-base sm:text-xl px-2 py-1 rounded-md focus:outline-none ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-black"}`}
          >
            {loading
              ? "Please wait..."
              : type == "signin"
                ? "Login"
                : "Register"}
          </button>
        </form>

        <p className=" text-sm sm:text-lg font-semibold">or</p>

        <div
          onClick={handleGoogleAuth}
          className="bg-white border hover:bg-black hover:text-white cursor-pointer w-full flex gap-2 overflow-hidden p-2 rounded-full justify-center items-center"
        >
          <p className="text-base sm:text-xl font-semibold">continue with</p>
          <div className="">
            <img
              className="w-8 h-8 sm:w-10 sm:h-10"
              src="/google_icon.svg"
              alt="Google Logo"
            />
          </div>
        </div>

        {type == "signin" ? (
          <p>
            Don't have an account? <Link className="hover:underline" to={"/signup"}>Sign Up</Link>
          </p>
        ) : (
          <p>
            Already have an account? <Link className="hover:underline" to={"/signin"}>Sign In</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthForm;
