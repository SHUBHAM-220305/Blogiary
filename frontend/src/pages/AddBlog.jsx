import axios from "axios";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import imageCompression from "browser-image-compression";

import ImageTool from "@editorjs/image";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import NestedList from "@editorjs/nested-list";
import CodeTool from "@editorjs/code";
import Marker from "@editorjs/marker";
import Underline from "@editorjs/underline";
import Embed from "@editorjs/embed";
import RawTool from "@editorjs/raw";
import textVariantTune from "@editorjs/text-variant-tune";
import useLoader from "../hooks/useLoader";

function AddBlog() {
  const { id } = useParams();
  const editorjsRef = useRef(null);

  const [isLoading, startLoading, stopLoading] = useLoader();
  const [tag, setTag] = useState("");

  const { token } = useSelector((slice) => slice.user);
  const { title, description, image, content, tags, draft } = useSelector(
    (slice) => slice.selectedBlog,
  );

  const [blogData, setBlogData] = useState({
    title: "",
    description: "",
    image: null,
    content: {
      blocks: [],
    },
    tags: [],
    draft: false,
  });

  const navigate = useNavigate();

  async function handlePostBlog() {
    const formData = new FormData();
    formData.append("title", blogData.title);
    formData.append("description", blogData.description);

    const compressedImage = await imageCompression(blogData.image, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });
    formData.append("image", compressedImage);
    formData.append("content", JSON.stringify(blogData.content));
    formData.append("tags", JSON.stringify(blogData.tags));
    formData.append("draft", blogData.draft);

    (blogData.content?.blocks || []).forEach((block) => {
      if (block.type === "image") {
        formData.append("images", block.data.file.image);
      }
    });

    try {
      startLoading();
      let res = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/blogs",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      stopLoading();
    }
  }

  async function handleUpdateBlog() {
    const formData = new FormData();
    formData.append("title", blogData.title);
    formData.append("description", blogData.description);
    formData.append("image", blogData.image);
    formData.append("content", JSON.stringify(blogData.content));
    formData.append("tags", JSON.stringify(blogData.tags));
    formData.append("draft", blogData.draft);

    let existingImages = [];
    blogData.content.blocks.forEach((block) => {
      if (block.type === "image") {
        if (block.data.file.image) {
          formData.append("images", block.data.file.image);
        } else {
          existingImages.push({
            url: block.data.file.url,
            imageId: block.data.file.imageId,
          });
        }
      }
    });

    formData.append("existingImages", JSON.stringify(existingImages));

    try {
      startLoading();
      let res = await axios.patch(
        import.meta.env.VITE_BACKEND_URL + `/blogs/${id}`,
        formData,
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
      stopLoading();
    }
  }

  async function fetchBlogById() {
    setBlogData({
      title: title,
      description: description,
      image: image,
      content: content,
      tags: tags,
      draft: draft,
    });
  }

  function initializeEditorjs() {
    const editor = new EditorJS({
      holder: "editorjs",
      placeholder: "Write Something...",
      data: content,
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            placeholder: "Enter a header",
            levels: [2, 3, 4],
            defaultLevel: 3,
          },
        },
        List: {
          class: NestedList,
          inlineToolbar: true,
          config: {},
        },
        code: CodeTool,
        marker: Marker,
        underline: Underline,
        embed: Embed,
        raw: RawTool,
        textVariant: textVariantTune,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: async (image) => {
                return {
                  success: 1,
                  file: {
                    url: URL.createObjectURL(image),
                    image,
                  },
                };
              },
            },
          },
        },
      },
      onChange: async () => {
        let data = await editorjsRef.current.save();
        setBlogData((blogData) => ({
          ...blogData,
          content: data,
        }));
      },
    });
    editorjsRef.current = editor;
  }

  function handleTagKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();

      const newTag = tag.trim();

      if (!newTag) return;

      if (blogData.tags.length >= 10) {
        toast.error("You can add upto maximum 10 tags");
        return;
      }

      if (blogData.tags.includes(newTag)) {
        toast.error("Tag already added");
        return;
      }

      setBlogData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));

      setTag("");
    }
  }

  function deleteTag(index) {
    const updatedTags = blogData.tags.filter(
      (_, tagIndex) => tagIndex !== index,
    );
    setBlogData((prev) => ({ ...prev, tags: updatedTags }));
  }

  useEffect(() => {
    if (id) {
      fetchBlogById();
    }
  }, [id]);

  useEffect(() => {
    if (!editorjsRef.current) {
      initializeEditorjs();
    }
    return () => {
      if (
        editorjsRef.current &&
        typeof editorjsRef.current.destroy === "function"
      ) {
        editorjsRef.current.destroy();
        editorjsRef.current = null;
      }
    };
  }, []);

  return token == null ? (
    <Navigate to={"/signin"} />
  ) : (
    <div className="p-5 w-full sm:w-[500px] lg:w-[1000px] mx-auto">
      <div className="lg:flex lg:justify-between gap-10">

        <div className="lg:w-3/6">
          <h2 className="text-2xl font-semibold my-2">Image</h2>
          <label htmlFor="image" className="">
            {blogData.image ? (
              <img
                src={
                  typeof blogData.image == "string"
                    ? blogData.image
                    : URL.createObjectURL(blogData.image)
                }
                alt=""
                className="aspect-video object-cover border border-slate-300 rounded-lg"
              />
            ) : (
              <div className="aspect-video bg-white border border-slate-300 rounded-lg opacity-50 flex justify-center items-center text-4xl">
                Select Image
              </div>
            )}
          </label>
          <input
            className="hidden"
            id="image"
            type="file"
            accept=".png, .jpeg, .jpg"
            onChange={(e) =>
              setBlogData((blogData) => ({
                ...blogData,
                image: e.target.files[0],
              }))
            }
          />
        </div>

        <div className="lg:w-3/6">
          <div className="my-4">
            <h2 className="text-2xl font-semibold my-2">Title</h2>
            <input
              type="text"
              placeholder="Enter your blog title"
              onChange={(e) =>
                setBlogData((blogData) => ({
                  ...blogData,
                  title: e.target.value,
                }))
              }
              value={blogData.title}
              className="border focus:outline-none rounded-lg w-full p-2 placeholder:text-lg"
            />
          </div>

          <div className="my-4">
            <h2 className="text-2xl font-semibold my-2">Tags</h2>
            <input
              type="text"
              placeholder="Enter tags for your blog"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              disabled={blogData.tags.length >= 10}
              className={`border focus:outline-none rounded-lg w-full p-2 placeholder:text-lg ${blogData.tags.length >= 10 ? "opacity-50 cursor-not-allowed" : ""}`}
            />

            <div className="flex justify-between my-1">
              <p className="text-sm opacity-60 font-medium pl-2">
                *Click on Space bar or Enter to add Tag
              </p>
              <p className="text-sm text-red-600 font-medium pl-2">
                {10 - blogData.tags.length} tags remaining
              </p>
            </div>

            <div className="flex flex-wrap gap-2 my-3">
              {blogData?.tags?.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-gray-200 text-black hover:bg-red-600 hover:text-white rounded-full px-3"
                >
                  <p className="font-normal text-base">{tag}</p>
                  <i
                    onClick={() => deleteTag(index)}
                    className="fi fi-ss-cross-circle pt-1 cursor-pointer"
                  ></i>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="my-4">
        <h2 className="text-2xl font-semibold my-2">Description</h2>
        <textarea
          type="text"
          placeholder="Enter a brief description for your blog"
          onChange={(e) =>
            setBlogData((blogData) => ({
              ...blogData,
              description: e.target.value,
            }))
          }
          value={blogData.description}
          className="h-[100px] resize-none w-full p-3 rounded-lg text-lg focus:outline-none border"
        />
      </div>

      <div className="my-4">
        <h2 className="text-2xl font-semibold my-2">Draft</h2>
        <button
          onClick={() =>
            setBlogData((prev) => ({
              ...prev,
              draft: !prev.draft,
            }))
          }
          className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300
                      ${blogData.draft ? "bg-black" : "bg-gray-300"}`}
        >
          <span
            className={`h-4 w-4 bg-white rounded-full shadow-md transform transition-transform duration-300
                      ${blogData.draft ? "translate-x-6" : "translate-x-0"}`}
          />
        </button>

        <span className="text-sm opacity-70">
          {blogData.draft ? "On" : "Off"}
        </span>
      </div>

      <div className="my-4">
        <h2 className="text-2xl font-semibold my-2">Content</h2>
        <div id="editorjs" className="border p-3 rounded-lg"></div>
      </div>

      <button
        disabled={uploading}
        className="text-white text-lg p-2 px-7 rounded-lg font-semibold focus:outline-none bg-black"
        onClick={id ? handleUpdateBlog : handlePostBlog}
      >
        {blogData.draft ? "Save Draft" : id ? "Update Blog" : "Post Blog"}
      </button>
    </div>
  );
}

export default AddBlog;
