import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);

  const mismatch = password && confirm && password !== confirm;

  async function handleReset() {
    if (mismatch) return;

    try {
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL + `/reset-password/${token}`,
        { newPassword: password }
      );
      toast.success(res.data.message);
      navigate("/signin");
    } catch (err) {
      toast.error(err.response.data.message);
    }
  }

  return (
    <div className="flex flex-col gap-3 w-[350px] mx-auto mt-20">
      <h2 className="text-2xl font-bold">Reset Password</h2>

      <input
        type={show ? "text" : "password"}
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type={show ? "text" : "password"}
        placeholder="Confirm Password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      {mismatch && (
        <p className="text-red-500 text-sm">Passwords do not match</p>
      )}

      <label className="flex gap-2 text-sm">
        <input type="checkbox" onChange={() => setShow(!show)} />
        Show password
      </label>

      <button
        onClick={handleReset}
        disabled={mismatch}
        className="bg-black text-white p-2"
      >
        Reset Password
      </button>
    </div>
  );
}

export default ResetPassword;