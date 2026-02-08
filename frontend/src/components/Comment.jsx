import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsOpen } from "../utils/commentSlice";
import axios from "axios";
import toast from "react-hot-toast";
import {
  deleteCommentAndReply,
  setCommentLikes,
  setComments,
  setReplies,
  setUpdatedComments,
} from "../utils/selectedBlogSlice";
import { formatDate } from "../utils/formatDate";

function Comment() {
  const dispatch = useDispatch();
  const commentRef = useRef(null);
  const [comment, setComment] = useState("");
  const [activeReply, setActiveReply] = useState(null);
  const [currentPopup, setCurrentPopup] = useState(null);
  const [currentEditComment, setCurrentEditComment] = useState(null);

  const {
    _id: blogId,
    comments,
    creator: { _id: creatorId },
  } = useSelector((state) => state.selectedBlog);
  const { token, id: userId } = useSelector((state) => state.user);

  async function handleComment() {
    try {
      let res = await axios.post(
        import.meta.env.VITE_BACKEND_URL + `/blogs/comment/${blogId}`,
        { comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(res.data.message);
      setComment("");
      dispatch(setComments(res.data.newComment));
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  }

  useEffect(() => {
    commentRef.current?.focus();
  }, []);

  return (
    <div className="bg-white h-screen p-5 fixed top-0 right-0 w-[400px] border-l shadow-xl overflow-y-scroll">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-medium">Comment ({comments.length})</h1>
        <i
          onClick={() => dispatch(setIsOpen(false))}
          className="fi fi-bs-cross text-lg mt-1 cursor-pointer"
        ></i>
      </div>

      <div className="my-4">
        <textarea
          ref={commentRef}
          value={comment}
          type="text"
          placeholder="Comment..."
          className="h-[150px] resize-none drop-shadow-md w-full p-3 text-lg focus:outline-none"
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleComment();
            }
          }}
        />
        <button
          onClick={handleComment}
          className="bg-black text-white px-7 py-3 my-2"
        >
          Add
        </button>
      </div>

      <div className="mt-4">
        <DisplayComments
          comments={comments}
          userId={userId}
          blogId={blogId}
          token={token}
          activeReply={activeReply}
          setActiveReply={setActiveReply}
          currentPopup={currentPopup}
          setCurrentPopup={setCurrentPopup}
          currentEditComment={currentEditComment}
          setCurrentEditComment={setCurrentEditComment}
          creatorId={creatorId}
        />
      </div>
    </div>
  );
}

function DisplayComments({
  comments,
  userId,
  blogId,
  token,
  activeReply,
  setActiveReply,
  currentPopup,
  setCurrentPopup,
  currentEditComment,
  setCurrentEditComment,
  creatorId,
}) {
  const dispatch = useDispatch();
  const replyRef = useRef(null);
  const [reply, setReply] = useState("");
  const [updatedCommentContent, setUpdatedCommentContent] = useState("");

  async function handleReply(parentCommentId) {
    try {
      let res = await axios.post(
        import.meta.env.VITE_BACKEND_URL +
          `/comment/${parentCommentId}/${blogId}`,
        { reply },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(res.data.message);
      setReply("");
      dispatch(setReplies(res.data.newReply));
      setActiveReply(null);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  }

  async function handleCommentLike(commentId) {
    try {
      let res = await axios.patch(
        import.meta.env.VITE_BACKEND_URL + `/blogs/like-comment/${commentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(res.data.message);
      dispatch(setCommentLikes({ commentId, userId }));
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  }

  function handleActiveReply(id) {
    setActiveReply((prev) => (prev === id ? null : id));
  }

  async function handleCommentUpdate(id) {
    try {
      let res = await axios.patch(
        import.meta.env.VITE_BACKEND_URL + `/blogs/comment/${id}`,
        { updatedCommentContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(res.data.message);
      dispatch(setUpdatedComments(res.data.updatedComment));
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      setUpdatedCommentContent("");
      setCurrentEditComment(null);
    }
  }

  async function handleCommentDelete(id) {
    try {
      let res = await axios.delete(
        import.meta.env.VITE_BACKEND_URL + `/blogs/comment/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(res.data.message);

      dispatch(deleteCommentAndReply(id));
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  }

  useEffect(() => {
    if (activeReply) {
      replyRef.current?.focus();
    }
  }, [activeReply]);

  return (
    <>
      {comments.map((comm) => (
        <>
          <hr className="my-2" />
          <div className="flex flex-col gap-2 my-4">
            {currentEditComment === comm._id ? (
              <div className="my-4">
                <textarea
                  defaultValue={comm.comment}
                  type="text"
                  placeholder="Reply..."
                  className="h-[150px] resize-none drop-shadow-md w-full p-3 text-lg focus:outline-none"
                  onChange={(e) => setUpdatedCommentContent(e.target.value)}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentEditComment(null)}
                    className="bg-red-500 text-white px-7 py-3 my-2 rounded-3xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleCommentUpdate(comm._id)}
                    className="bg-black text-white px-7 py-3 my-2 rounded-3xl"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex w-full justify-between">
                  <div className="flex gap-2">
                    <div className="w-10 h-10">
                      <img
                        src={`https://api.dicebear.com/9.x/initials/svg?seed=${comm.user.name}`}
                        alt=""
                        className="rounded-full"
                      />
                    </div>
                    <div>
                      <p className="capitalize font-medium">{comm.user.name}</p>
                      <p className="font-medium text-lg">
                        {formatDate(comm.createdAt)}
                      </p>
                    </div>
                  </div>

                  {comm.user._id === userId || userId === creatorId ? (
                    currentPopup === comm._id ? (
                      <div className="bg-white absolute right-3 w-20 rounded-md shadow-lg border border-gray-200 overflow-hidden">
                        <i
                          onClick={() =>
                            setCurrentPopup((prev) =>
                              prev == comm._id ? null : comm._id,
                            )
                          }
                          className="fi fi-bs-cross text-sm relative left-14 mt-1 cursor-pointer"
                        ></i>
                        {comm.user._id === userId ? (
                          <p
                            onClick={() => {
                              setCurrentEditComment(comm._id);
                              setCurrentPopup(null);
                            }}
                            className="px-2 py-1 hover:bg-black hover:text-white border-b border-gray-100 cursor-pointer"
                          >
                            Edit
                          </p>
                        ) : (
                          ""
                        )}

                        <p
                          onClick={() => {
                            handleCommentDelete(comm._id);
                            setCurrentPopup(null);
                          }}
                          className="px-2 py-1 hover:bg-red-600 hover:text-white rounded-b-md border-t border-gray-100 cursor-pointer"
                        >
                          Delete
                        </p>
                      </div>
                    ) : (
                      <i
                        onClick={() => setCurrentPopup(comm._id)}
                        className="fi fi-bs-menu-dots cursor-pointer"
                      ></i>
                    )
                  ) : (
                    ""
                  )}
                </div>

                <p className="font-medium text-lg">{comm.comment}</p>

                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <div className="cursor-pointer flex gap-2">
                      {comm.likes.includes(userId) ? (
                        <i
                          className="fi fi-ss-heart text-red-600 text-xl mt-1"
                          onClick={() => handleCommentLike(comm._id)}
                        ></i>
                      ) : (
                        <i
                          className="fi fi-rs-heart text-xl mt-1"
                          onClick={() => handleCommentLike(comm._id)}
                        ></i>
                      )}
                      <p className="text-xl">{comm.likes.length}</p>
                    </div>
                    <div className="flex gap-2 cursor-pointer">
                      <i className="fi fi-rr-comment-alt text-xl mt-1"></i>
                      <p className="text-xl">{comm.replies.length}</p>
                    </div>
                  </div>
                  <p
                    className="text-lg cursor-pointer hover:underline"
                    onClick={() => handleActiveReply(comm._id)}
                  >
                    Reply
                  </p>
                </div>
              </>
            )}

            {activeReply === comm._id && (
              <div className="my-4">
                <textarea
                  ref={replyRef}
                  type="text"
                  placeholder="Reply..."
                  className="h-[150px] resize-none drop-shadow-md w-full p-3 text-lg focus:outline-none"
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleReply(comm._id);
                    }
                  }}
                />
                <button
                  onClick={() => handleReply(comm._id)}
                  className="bg-black text-white px-7 py-3 my-2"
                >
                  Add
                </button>
              </div>
            )}

            {comm.replies.length > 0 && (
              <div className="pl-6 border-l-2">
                <DisplayComments
                  comments={comm.replies}
                  userId={userId}
                  blogId={blogId}
                  token={token}
                  activeReply={activeReply}
                  setActiveReply={setActiveReply}
                  currentPopup={currentPopup}
                  setCurrentPopup={setCurrentPopup}
                  currentEditComment={currentEditComment}
                  setCurrentEditComment={setCurrentEditComment}
                  creatorId={creatorId}
                />
              </div>
            )}
          </div>
        </>
      ))}
    </>
  );
}

export default Comment;
