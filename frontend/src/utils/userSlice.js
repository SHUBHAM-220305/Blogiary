import { createSlice } from "@reduxjs/toolkit";

let initialState = { token: null }; // default

try {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    initialState = JSON.parse(storedUser); // only parse if exists
  }
} catch (err) {
  console.error("Invalid user data in localStorage. Resetting...", err);
  localStorage.removeItem("user");
}

const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    login(state, action) {
      localStorage.setItem("user", JSON.stringify(action.payload));
      return action.payload;
    },
    logout(state, action) {
      localStorage.removeItem("user");
      return {
        token: null,
      };
    },

    updateData(state, action) {
      const data = action.payload;
      if (data[0] === "visibility") {
        localStorage.setItem("user", JSON.stringify({ ...state, ...data[1] }));
        return { ...state, ...data };
      } else if (data[0] === "followers") {
        const finalData = {
          ...state,
          following: state?.following?.includes(data[1])
            ? state?.following?.filter((id) => id !== data[1])
            : [...state.following, data[1]],
        };

        localStorage.setItem("user", JSON.stringify(finalData));
        return finalData;
      }
    },
  },
});

export const { login, logout, updateData } = userSlice.actions;
export default userSlice.reducer;
