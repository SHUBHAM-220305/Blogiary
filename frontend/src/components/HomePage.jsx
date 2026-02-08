import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";
import { handleSaveBlogs } from "../pages/BlogPage";
import { useSelector } from "react-redux";
import DisplayBlogs from "./DisplayBlogs";
import toast from "react-hot-toast";
import usePagination from "../hooks/usePagination";

function HomePage() {
  const [page, setPage] = useState(1);
  const [topTags, setTopTags] = useState([]);

  const { blogs, hasMore } = usePagination("blogs", {}, 3, page);

  const { token, id: userId } = useSelector((state) => state.user);

  async function getTopTags() {
    try {
      const res = await axios.get(
        import.meta.env.VITE_BACKEND_URL + "/tags/top",
      );
      setTopTags(res.data.tags);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getTopTags();
  }, []);

  return (
    <div className="w-full lg:w-[80%] 2xl:w-[60%] mx-auto flex p-5">
      <div className="w-full md:w-[60%] md:pr-10">
        <DisplayBlogs blogs={blogs} />
        <div className="flex justify-end mt-2">
          {hasMore && (
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="bg-black text-white px-4 py-1 rounded-full font-medium text-base"
            >
              Load more...
            </button>
          )}
        </div>
      </div>

      <div className="hidden md:block w-[40%] border-l pl-10 sticky top-0 self-start min-h-[calc(100vh_-_70px)] my-10">
        <div>
          <h1 className="text-xl font-semibold">Recommended Topics</h1>
          <div className="flex flex-wrap gap-3 my-5">
            {topTags.map((tags) => (
              <Link key={tags.tag} to={`/tag/${tags.tag}`}>
                <div className="flex items-center bg-gray-200 text-black hover:bg-black hover:text-white rounded-full px-3 py-1 cursor-pointer">
                  <p className="font-normal text-base">#{tags.tag}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
