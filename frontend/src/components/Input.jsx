import React from "react";
import { useState } from "react";

function Input({ type, placeholder, setUserData, changedField, value, icon }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <i
        className={`fi ${icon} absolute top-1/2 -translate-y-1/2 mt-1 left-4 opacity-50`}
      ></i>
      <input
        value={value}
        type={type !== "password" ? type : (showPassword ? "text" : type)}
        className="w-full h-[35px] sm:h-[50px] pl-10 text-black text-base sm:text-xl p-3 rounded-full focus:outline-none border"
        placeholder={placeholder}
        onChange={(e) =>
          setUserData((prev) => ({
            ...prev,
            [changedField]: e.target.value,
          }))
        }
      />
      {type === "password" && (
        <i
          className={
            `fi ${showPassword
              ? "fi-rr-eye"
              : "fi-rr-eye-crossed"} absolute top-1/2 -translate-y-1/2 mt-1 right-4 opacity-50 cursor-pointer`
          }
          onClick={() => setShowPassword((prev) => !prev)}
        ></i>
      )}
    </div>
  );
}

export default Input;
