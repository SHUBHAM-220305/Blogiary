import React from "react";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../utils/userSlice";
import axios from "axios";
import toast from "react-hot-toast";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const popupRef = useRef(null);
  const avatarRef = useRef(null);

  const { token, name, profilePic, username } = useSelector(
    (state) => state.user,
  );
  const [showPopUp, setShowPopUp] = useState(false);
  const [searchQuery, setSearchQuery] = useState(null);
  const [showSearchBar, setShowSearchBar] = useState(false);

  function handleLogout() {
    setShowPopUp(false);
    dispatch(logout());
    navigate("/");
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(e.target)
      ) {
        setShowPopUp(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!location.pathname.startsWith("/search")) {
      setSearchQuery("");
    }
  }, [location.pathname]);

  return (
    <>
      <div className="bg-white w-full relative z-[100] flex justify-between items-center h-[70px] px-[20px] border-b drop-shadow-lg top-0">
        <div className="flex items-center gap-2 sm:gap-4 relative">
          <Link to="/">
            <div className="inline-block">
              <img src="/logo.svg" alt="Logo" className="w-auto h-6 sm:h-8" />
            </div>
          </Link>

          <div className={`relative max-sm:absolute sm:block max-sm:top-16${showSearchBar ? ' max-sm:block z-[200]' : ` max-sm:hidden`}`}>
            <i className="fi fi-rr-search absolute text-lg top-1/2 -translate-y-1/2 ml-4 opacity-40"></i>
            <input
              type="text"
              className="focus:outline-none bg-gray-100 max-sm:w-[calc(100vw_-_70px)] rounded-full pl-12 p-2"
              placeholder="Search"
              value={searchQuery ? searchQuery : ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setShowSearchBar(false);
                  if (!searchQuery?.trim()) {
                    navigate("/");
                  } else {
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                  }
                }
              }}
            />
          </div>

        </div>

        <div className="absolute left-1/2 -translate-x-1/2 font-serif font-extrabold text-2xl z-10 pointer-events-none sm:text-4xl hidden md:block">
          Blogiary
        </div>

        <div className="flex justify-center items-center gap-3 sm:gap-5">
          <i className="fi fi-rr-search text-lg sm:hidden mt-1 cursor-pointer" onClick={() => setShowSearchBar((prev) => !prev)}></i>

          <Link to="/add-blog">
            <div className="flex gap-2 items-center">
              <i className="fi fi-tr-file-edit text-2xl mt-1"></i>
              <span className="text-lg hidden sm:inline">Write</span>
            </div>
          </Link>

          {token ? (
            <div
              ref={avatarRef}
              onClick={() => setShowPopUp((prev) => !prev)}
              className="w-10 h-10 cursor-pointer overflow-hidden hover:bg-gray-200 rounded-full"
            >
              <img
                src={
                  profilePic
                    ? profilePic
                    : `https://api.dicebear.com/9.x/initials/svg?seed=${name}`
                }
                alt=""
                className="w-full h-full rounded-full object-contain"
              />
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <Link to="/signup">
                <button className="bg-black text-white px-3 py-1 sm:px-5 sm:py-3 rounded-full text-xs sm:text-base">
                  Signup
                </button>
              </Link>
              <Link to="/signin">
                <button className="px-3 py-1 sm:px-5 sm:py-3 text-xs sm:text-base rounded-full border">
                  Signin
                </button>
              </Link>
            </div>
          )}
        </div>

        {showPopUp ? (
          <div
            ref={popupRef}
            className="w-[150px] bg-gray-50 border z-[200] absolute drop-shadow-md right-2 top-14 rounded-md overflow-hidden"
          >
            <Link to={`/@${username}`}>
              <p onClick={() => setShowPopUp(false)} className="popup">
                View Profile
              </p>
            </Link>
            <Link to="/edit-profile">
              <p onClick={() => setShowPopUp(false)} className="popup">
                Edit Profile
              </p>
            </Link>
            <Link to="/settings">
              <p onClick={() => setShowPopUp(false)} className="popup">
                Settings
              </p>
            </Link>
            <p className="popup" onClick={handleLogout}>
              Logout
            </p>
          </div>
        ) : (
          ""
        )}
      </div>
      <Outlet />
    </>
  );
}

export default Navbar;
