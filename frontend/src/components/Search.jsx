import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import DisplayBlogs from "./DisplayBlogs";
import usePagination from "../hooks/usePagination";

function Search() {
  const [page, setPage] = useState(1);
  const { tag } = useParams();

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q");

  const query = tag
    ? { tag: tag.toLowerCase().replace(/\s+/g, "-") }
    : { search: searchQuery };

  const { blogs, hasMore } = usePagination("search-blogs", query, 10, page);

  return (
    <div className="w-full p-5 sm:w-[80%] md:w-[60%] lg:w-[55%] mx-auto">
      <h1 className="text-4xl md:text-6xl font-bold my-10">
        <span className="text-black/60">Results for</span>
        <span className="text-black"> {tag ? tag : searchQuery}</span>
      </h1>

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
  );
}

export default Search;
