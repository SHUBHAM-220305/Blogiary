import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function usePagination( path, queryParams = {}, limit = 3, page = 1 ) {
  const [blogs, setBlogs] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSearchBlogs() {
      try {
        let res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/${path}`,
          { params: { ...queryParams, page, limit} },
        );
        setBlogs((prev) => [...prev, ...res.data.blogs]);
        setHasMore(res.data.hasMore);
      } catch (error) {
        navigate(-1);
        setBlogs([]);
        toast.error(error.response.data.message);
        setHasMore(false);
      }
    }

    fetchSearchBlogs();
  }, [page]);

  return { blogs, hasMore };
}

export default usePagination;
