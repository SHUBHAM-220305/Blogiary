import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DisplayBlogs from "../components/DisplayBlogs";
import useLoader from "../hooks/useLoader";
import { toggleFollowUser } from "../utils/userThunks";

function ProfilePage() {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [isLoading, startLoading, stopLoading] = useLoader();
  const [error, setError] = useState(null);
  const location = useLocation();
  const dispatch = useDispatch();

  const {
    token,
    id: userId,
    username: currentUser,
  } = useSelector((state) => state.user);

  function renderComponent() {
    if (location.pathname === `/${username}`) {
      return (
        <DisplayBlogs blogs={userData.blogs.filter((blog) => !blog.draft)} />
      );
    } else if (location.pathname === `/${username}/saved-blogs`) {
      return (
        <>
          {userData._id === userId || userData.showSavedBlogs ? (
            <DisplayBlogs blogs={userData.saveBlogs} />
          ) : (
            <Navigate to={`/${username}`} replace />
          )}
        </>
      );
    } else if (location.pathname === `/${username}/liked-blogs`) {
      return (
        <>
          {userData._id === userId || userData.showLikedBlogs ? (
            <DisplayBlogs blogs={userData.likeBlogs} />
          ) : (
            <Navigate to={`/${username}`} replace />
          )}
        </>
      );
    } else if (location.pathname === `/${username}/drafts`) {
      return (
        <>
          {userData._id === userId ? (
            <DisplayBlogs blogs={userData.blogs.filter((blog) => blog.draft)} />
          ) : (
            <Navigate to={`/${username}`} replace />
          )}
        </>
      );
    }
    return null;
  }

  async function fetchUserDetails() {
    startLoading();
    setError(null);
    try {
      let res = await axios.get(
        import.meta.env.VITE_BACKEND_URL + `/users/${username.split("@")[1]}`,
      );
      setUserData(res.data.user);
    } catch (error) {
      setError("Failed to load profile");
      toast.error(error.response.data.message);
    } finally {
      stopLoading();
    }
  }

  async function handleFollow(followUserId) {
    if (!token) return toast.error("Please sign in");
    dispatch(toggleFollowUser({ followUserId, token }));
  }

  useEffect(() => {
    fetchUserDetails();
  }, [username]);

  return (
    <div className="w-full flex justify-center">
      {isLoading && <h1>Loading...</h1>}
      {error && <h1 className="text-red-500">{error}</h1>}
      {!isLoading && !error && userData && (
        <div className="w-[80%] flex max-lg:flex-col-reverse justify-evenly">
          <div className="w-full lg:w-[55%]">
            <div className="justify-between my-10 hidden lg:flex">
              <h1 className="text-4xl font-bold capitalize">{userData.name}</h1>
              <i className="fi fi-bs-menu-dots cursor-pointer pt-2"></i>
            </div>

            <div className="my-4">
              <nav className="my-4">
                <ul className="flex gap-6 whitespace-nowrap">
                  <li>
                    <Link
                      to={`/${username}`}
                      className={`${location.pathname === `/${username}` ? "border-b-2 border-black font-semibold" : ""} pb-1`}
                    >
                      Home
                    </Link>
                  </li>
                  {(userData._id === userId || userData.showSavedBlogs) && (
                    <li>
                      <Link
                        to={`/${username}/saved-blogs`}
                        className={`${location.pathname === `/${username}/saved-blogs` ? "border-b-2 border-black font-semibold" : ""} pb-1`}
                      >
                        Saved <span className="hidden lg:inline">Blogs</span>
                      </Link>
                    </li>
                  )}
                  {(userData._id === userId || userData.showLikedBlogs) && (
                    <li>
                      <Link
                        to={`/${username}/liked-blogs`}
                        className={`${location.pathname === `/${username}/liked-blogs` ? "border-b-2 border-black font-semibold" : ""} pb-1`}
                      >
                        Liked <span className="hidden lg:inline">Blogs</span>
                      </Link>
                    </li>
                  )}
                  {userData._id === userId && (
                    <li>
                      <Link
                        to={`/${username}/drafts`}
                        className={`${location.pathname === `/${username}/drafts` ? "border-b-2 border-black font-semibold" : ""} pb-1`}
                      >
                        Drafts
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>

              {renderComponent()}
            </div>
          </div>

          <div className="w-full lg:w-[25%] lg:border-l lg:pl-10 lg:sticky lg:top-0 self-start lg:min-h-[calc(100vh_-_70px)]">
            <div className="my-10">
              <div className="w-20 h-20 cursor-pointer overflow-hidden hover:bg-gray-200 rounded-full">
                <img
                  src={
                    userData.profilePic
                      ? userData.profilePic
                      : `https://api.dicebear.com/9.x/initials/svg?seed=${userData.name}`
                  }
                  alt=""
                  className="w-full h-full rounded-full object-cover border"
                />
              </div>

              <p className="text-lg font-medium my-3">{userData.name}</p>

              <p className="text-slate-700 opacity-80">
                {userData.followers.length} Follower
                {userData.followers.length == 1 ? "" : "s"}
              </p>

              <p className="text-sm my-4 text-slate-700 opacity-80 font-normal">
                {userData.bio}
              </p>

              {currentUser == username.split("@")[1] ? (
                <button className="px-3 py-1 bg-black rounded-full text-white text-base cursor-pointer max-lg:w-full">
                  <Link to="/edit-profile">Edit Profile</Link>
                </button>
              ) : (
                <button
                  className="px-3 py-1 bg-black rounded-full text-white text-base cursor-pointer max-lg:w-full"
                  onClick={() => handleFollow(userData._id)}
                >
                  {userData.followers.some(
                    (follower) =>
                      follower === userId || follower?._id === userId,
                  )
                    ? "Unfollow"
                    : "Follow"}
                </button>
              )}
            </div>
            <div className="hidden lg:block">
              {userData.following.length > 0 && (
                <>
                  <h2 className="text-lg font-medium my-3">Following</h2>
                  <div className="">
                    {userData.following.map((followingUser) => (
                      <div
                        key={followingUser._id}
                        className="flex justify-between"
                      >
                        <Link to={`/@${followingUser.username}`}>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 cursor-pointer overflow-hidden hover:bg-gray-200 rounded-sm">
                              <img
                                src={
                                  followingUser.profilePic
                                    ? followingUser.profilePic
                                    : `https://api.dicebear.com/9.x/initials/svg?seed=${followingUser.name}`
                                }
                                alt=""
                                className="w-full h-full rounded-sm object-contain border"
                              />
                            </div>

                            <p className="text-sm text-slate-600 opacity-80 font-normal hover:underline cursor-pointer">
                              {followingUser.name}
                            </p>
                          </div>
                        </Link>

                        <div className="flex justify-center items-center pb-1 hover:bg-gray-200 w-6 h-6 rounded-sm">
                          <i className="fi fi-bs-menu-dots cursor-pointer pt-2"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
