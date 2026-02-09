import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  addSelectedBlog,
  changeLikes,
  removeSelectedBlog,
  toggleSave,
} from "../utils/selectedBlogSlice";
import Comment from "../components/Comment";
import { setIsOpen } from "../utils/commentSlice";
import { formatDate } from "../utils/formatDate";
import { updateData } from "../utils/userSlice";
import { calculateReadTime } from "../utils/calculateReadTime";
import { toggleFollowUser } from "../utils/userThunks";

export async function handleSaveBlogs(e, id, token) {
  e.preventDefault();
  e.stopPropagation();
  if (!token) {
    return toast.error("Please sign in to save blogs");
  }
  try {
    let res = await axios.patch(
      import.meta.env.VITE_BACKEND_URL + `/save-blog/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    toast.success(res.data.message);
  } catch (error) {
    toast.error(error.response.data.message);
  }
}

function BlogPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token, email, id: userId } = useSelector((state) => state.user);
  const { likes, comments, content, totalSaves } = useSelector(
    (state) => state.selectedBlog,
  );
  const { isOpen } = useSelector((state) => state.comment);

  const [blogData, setBlogData] = useState(null);
  const [isLike, setIsLike] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  async function fetchBlogById() {
    try {
      let {
        data: { blog },
      } = await axios.get(import.meta.env.VITE_BACKEND_URL + `/blogs/${id}`);
      setBlogData(blog);

      setIsLike(blog.likes.includes(userId));

      dispatch(addSelectedBlog(blog));
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  async function handleLike() {
    if (token) {
      try {
        let res = await axios.post(
          import.meta.env.VITE_BACKEND_URL + `/blogs/like/${blogData._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setIsLike((prev) => !prev);
        dispatch(changeLikes(userId));
        toast.success(res.data.message);
      } catch (error) {
        toast.error(error.response.data.message);
      }
    } else {
      return toast.error("Please Sign In to like the blog.");
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      return toast.error("Please sign in to save blogs");
    }

    dispatch(toggleSave(userId));

    try {
      const res = await axios.patch(
        import.meta.env.VITE_BACKEND_URL + `/save-blog/${blogData._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(res.data.message);
    } catch (error) {
      dispatch(toggleSave(userId));
      toast.error(error.response?.data?.message);
    }
  }

  async function handleDeleteBlog() {
    try {
      const res = await axios.delete(
        import.meta.env.VITE_BACKEND_URL + `/blogs/${blogData._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setShowDeleteModal(false);
    }
  }

  async function handleFollow(followUserId) {
    if (!token) return toast.error("Please sign in");
    dispatch(toggleFollowUser({ followUserId, token }));
  }

  useEffect(() => {
    fetchBlogById();
    return () => {
      dispatch(setIsOpen(false));
      dispatch(removeSelectedBlog());
    };
  }, [id]);

  return (
    <div className="p-5 max-w-[500px] mx-auto">
      {blogData ? (
        <div>
          <h1 className="mt-10 font-bold text-3xl sm:text-5xl capitalize">
            {blogData.title}
          </h1>
          <div className="flex items-center my-5 gap-3">
            <Link to={`/@${blogData.creator.username}`}>
              <div>
                <div className="w-10 h-10 cursor-pointer overflow-hidden hover:bg-gray-200 rounded-full">
                  <img
                    src={
                      blogData.creator.profilePic
                        ? blogData.creator.profilePic
                        : `https://api.dicebear.com/9.x/initials/svg?seed=${blogData.creator.name}`
                    }
                    alt=""
                    className="w-full h-full rounded-full object-contain"
                  />
                </div>
              </div>
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <Link to={`/@${blogData.creator.username}`}>
                  <h2 className="text-base sm:text-xl hover:underline cursor-pointer">
                    {blogData.creator.name}
                  </h2>
                </Link>
                {blogData.creator._id !== userId && (
                  <p
                    className="px-2 py-1 bg-black rounded-full text-white text-sm sm:text-base cursor-pointer"
                    onClick={() =>
                      handleFollow(blogData.creator._id)
                    }
                  >
                    {blogData.creator.followers.includes(userId)
                      ? "Unfollow"
                      : "Follow"}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <span>{calculateReadTime(blogData.content)}</span>
                <span className="">{formatDate(blogData.createdAt)}</span>
              </div>
            </div>
          </div>
          <img src={blogData.image} alt="" />

          {token && email == blogData.creator.email && (
            <button className="bg-green-400 mt-5 px-6 py-2 text-xl rounded">
              <Link to={"/edit/" + blogData.blogId}>Edit</Link>
            </button>
          )}

          {token && userId === blogData.creator._id && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 mx-2 sm:mx-5 mt-5 px-6 py-2 text-xl rounded"
            >
              Delete
            </button>
          )}

          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-[300px]">
                <h2 className="font-semibold text-lg mb-3">
                  Delete this blog?
                </h2>
                <p className="text-sm text-gray-600 mb-5">
                  This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-3 py-1 rounded-md border"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDeleteBlog}
                    className="px-3 py-1 rounded-md bg-red-600 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-7 mt-4">
            <div className="cursor-pointer flex gap-2">
              {isLike ? (
                <i
                  className="fi fi-ss-heart text-red-600 text-3xl mt-1"
                  onClick={handleLike}
                ></i>
              ) : (
                <i
                  className="fi fi-rs-heart text-3xl mt-1"
                  onClick={handleLike}
                ></i>
              )}
              <p className="text-3xl">{likes.length}</p>
            </div>

            <div className="flex gap-2 cursor-pointer">
              <i
                onClick={() => dispatch(setIsOpen())}
                className="fi fi-rr-comment-alt text-3xl mt-1"
              ></i>
              <p className="text-3xl">{comments.length}</p>
            </div>

            <div className="cursor-pointer flex gap-2" onClick={handleSave}>
              {totalSaves?.includes(userId) ? (
                <i className="fi fi-sr-bookmark text-3xl mt-1"></i>
              ) : (
                <i className="fi fi-rr-bookmark text-3xl mt-1"></i>
              )}
              <p className="text-3xl">{totalSaves.length}</p>
            </div>
          </div>

          <div className="my-10">
            {content?.blocks?.map((block, index) => {
              if (block.type == "header") {
                if (block.data.level == 2) {
                  return (
                    <h2
                      key={index}
                      className="font-bold text-4xl my-4"
                      dangerouslySetInnerHTML={{ __html: block.data.text }}
                    ></h2>
                  );
                } else if (block.data.level == 3) {
                  return (
                    <h3
                      key={index}
                      className="font-bold text-3xl my-4"
                      dangerouslySetInnerHTML={{ __html: block.data.text }}
                    ></h3>
                  );
                } else if (block.data.level == 4) {
                  return (
                    <h4
                      key={index}
                      className="font-bold text-2xl my-4"
                      dangerouslySetInnerHTML={{ __html: block.data.text }}
                    ></h4>
                  );
                }
              } else if (block.type == "paragraph") {
                return (
                  <p
                    key={index}
                    className="my-4"
                    dangerouslySetInnerHTML={{ __html: block.data.text }}
                  ></p>
                );
              } else if (block.type == "image") {
                return (
                  <div key={index} className="my-4">
                    <img src={block.data.file.url} alt="" />
                    <p className="text-center my-2">{block.data.caption}</p>
                  </div>
                );
              }
            })}
          </div>
        </div>
      ) : (
        <h1>Loading...</h1>
      )}

      {isOpen && <Comment />}
    </div>
  );
}

export default BlogPage;
