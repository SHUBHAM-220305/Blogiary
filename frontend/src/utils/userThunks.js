// utils/userThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { updateData } from "./userSlice";
import toast from "react-hot-toast";

export const toggleFollowUser = createAsyncThunk(
  "user/toggleFollowUser",
  async ({ followUserId, token }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.patch(
        import.meta.env.VITE_BACKEND_URL + `/follow/${followUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);

      dispatch(updateData(["followers", followUserId]));
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
