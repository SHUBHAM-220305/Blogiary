import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    try {
      setLoading(true);
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/forgot-password",
        { email },
      );
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 w-[350px] mx-auto mt-20">
      <h2 className="text-2xl font-bold">Forgot Password</h2>
      <input
        type="email"
        placeholder="Enter your email"
        className="border p-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSubmit} className="bg-black text-white p-2">
        Send Reset Link
      </button>
    </div>
  );
}

export default ForgotPassword;
