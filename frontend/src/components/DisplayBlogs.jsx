import React from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";
import { handleSaveBlogs } from "../pages/BlogPage";
import { useSelector } from "react-redux";
import { useEffect } from "react";

function DisplayBlogs({ blogs }) {
  const { token, id: userId } = useSelector((state) => state.user);

  return (
    <div>
      {blogs.length > 0 ? (
        blogs.map((blog) => (
          <Link key={blog._id} to={"/blog/" + blog.blogId}>
            <div className="w-full my-10 flex justify-between">
              <div className="w-[60%] flex flex-col gap-2">
                <div>
                  <img src={null} alt="" />
                  <p>{blog.creator.name}</p>
                </div>
                <h2 className="font-bold text-xl sm:text-2xl">{blog.title}</h2>
                <h4 className="line-clamp-2">{blog.description}</h4>
                <div className="flex gap-5">
                  <p>{formatDate(blog.createdAt)}</p>
                  <div className="flex gap-7">
                    <div className="cursor-pointer flex gap-2">
                      {blog.likes?.some((id) => id.toString() === userId) ? (
                        <i className="fi fi-ss-heart text-red-600 text-lg mt-1"></i>
                      ) : (
                        <i className="fi fi-rs-heart text-lg mt-1"></i>
                      )}
                      <p className="text-lg">{blog.likes.length}</p>
                    </div>

                    <div className="flex gap-2">
                      <i className="fi fi-rr-comment-alt text-lg mt-1"></i>
                      <p className="text-lg">{blog.comments.length}</p>
                    </div>

                    <div
                      className="cursor-pointer flex gap-2"
                      onClick={(e) => handleSaveBlogs(e, blog._id, token)}
                    >
                      {blog.totalSaves?.some(
                        (id) => id.toString() === userId,
                      ) ? (
                        <i className="fi fi-sr-bookmark text-lg mt-1"></i>
                      ) : (
                        <i className="fi fi-rr-bookmark text-lg mt-1"></i>
                      )}
                      <p className="text-lg">{blog.totalSaves.length}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[35%] sm:w-[25%]">
                <img src={blog.image} alt="" />
              </div>
            </div>
          </Link>
        ))
      ) : (
        <h1 className="my-10 text-2xl font-semibold text-center">
          No Data found
        </h1>
      )}
    </div>
  );
}

export default DisplayBlogs;
