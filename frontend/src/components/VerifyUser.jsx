import axios from "axios";
import React from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

function VerifyUser() {
  const { verificationToken } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function verifyUser() {
      try {
        let res = await axios.get(
          import.meta.env.VITE_BACKEND_URL +
            `/verify-email/${verificationToken}`,
        );
        toast.success(res.data.message);
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        navigate("/signin");
      }
    }
    verifyUser();
  }, [verificationToken]);
  return <div>Verify User</div>;
}

export default VerifyUser;
