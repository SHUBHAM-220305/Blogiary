import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";

function ChangePassword({setChangePass}) {
  const { token, googleAuth } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [passwordMatch, setPasswordMatch] = useState(true);

  if (googleAuth) {
    return (
      <p className="text-center text-gray-500 mt-6">
        Password change is disabled for Google accounts
      </p>
    );
  }

  useEffect(() => {
    if (form.confirmPassword && form.newPassword !== form.confirmPassword) {
      setPasswordMatch(false);
    } else {
      setPasswordMatch(true);
    }
  }, [form.newPassword, form.confirmPassword]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!passwordMatch) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await axios.patch(
        import.meta.env.VITE_BACKEND_URL + "/change-password",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Password changed successfully. Please login again.");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      dispatch(logout());
      navigate("/signin");
    } catch (err) {
      toast.error(err.response?.data?.message);
    } finally {
        setChangePass(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6 w-[75%] sm:w-[55%] md:[80%]">
      <div className="relative">
        <input
          type={showPassword.old ? "text" : "password"}
          placeholder="Old Password"
          value={form.oldPassword}
          onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
          className="border p-2 rounded w-full"
        />

        <i
          className={`fi ${
            showPassword.old ? "fi-rr-eye" : "fi-rr-eye-crossed"
          } absolute top-2 mt-1 right-3 opacity-50 cursor-pointer`}
          onClick={() =>
            setShowPassword({ ...showPassword, old: !showPassword.old })
          }
        ></i>
      </div>

      <div className="relative">
        <input
          type={showPassword.new ? "text" : "password"}
          placeholder="New Password"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          className="border p-2 rounded w-full"
        />

        <i
          className={`fi ${
            showPassword.new ? "fi-rr-eye" : "fi-rr-eye-crossed"
          } absolute top-2 mt-1 right-3 opacity-50 cursor-pointer`}
          onClick={() =>
            setShowPassword({ ...showPassword, new: !showPassword.new })
          }
        ></i>
      </div>

      <div className="relative">
        <input
          type={showPassword.confirm ? "text" : "password"}
          placeholder="Confirm New Password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
          className={`border p-2 rounded w-full ${
            !passwordMatch ? "border-red-500" : ""
          }`}
        />

        <i
          className={`fi ${
            showPassword.confirm ? "fi-rr-eye" : "fi-rr-eye-crossed"
          } absolute top-2 mt-1 right-3 opacity-50 cursor-pointer`}
          onClick={() =>
            setShowPassword({ ...showPassword, confirm: !showPassword.confirm })
          }
        ></i>
      </div>

      {!passwordMatch && (
        <p className="text-red-500 text-sm -mt-4">Passwords do not match</p>
      )}

      <button
        type="submit"
        className="bg-black text-white p-2 rounded font-semibold mt-2"
      >
        Change Password
      </button>
    </form>
  );
}

export default ChangePassword;
