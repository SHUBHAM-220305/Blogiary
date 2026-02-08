const Blog = require("../models/blogSchema");
const User = require("../models/userSchema");
const Comment = require("../models/commentSchema");
const {
  uploadImage,
  deleteImageFromCloudinary,
} = require("../utils/uploadImage");
const ShortUniqueId = require("short-unique-id");
const { randomUUID } = new ShortUniqueId({ length: 10 });

async function createBlog(req, res) {
  try {
    const creator = req.user;

    const { title, description } = req.body;
    const draft = req.body.draft === "true";
    const image = req.files?.image;
    const images = req.files?.images || [];
    const content = JSON.parse(req.body.content);
    let tags = [];

    try {
      tags = JSON.parse(req.body.tags);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid tags format",
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Please enter the title",
      });
    }

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Please enter the description",
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Please enter the content",
      });
    }

    const findUser = await User.findById(creator);

    if (!findUser) {
      return res.status(500).json({
        success: false,
        message: "User not detected",
      });
    }

    let imageIndex = 0;
    for (let i = 0; i < content.blocks.length; i++) {
      const block = content.blocks[i];
      if (block.type === "image") {
        const { secure_url, public_id } = await uploadImage(
          `data:image/jpeg;base64,${images[imageIndex].buffer.toString(
            "base64",
          )}`,
        );
        block.data.file = {
          url: secure_url,
          imageId: public_id,
        };
        imageIndex++;
      }
    }

    const imageFile = Array.isArray(image) ? image[0] : image;
    const { secure_url, public_id } = await uploadImage(
      `data:image/jpeg;base64,${imageFile.buffer.toString("base64")}`,
    );

    content.blocks = content.blocks.map((block) => {
      if (block.type === "List") {
        block.type = "list";
      }
      return block;
    });

    if (!Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: "Tags must be an array",
      });
    }

    tags = tags
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);

    tags = [...new Set(tags)];

    if (tags.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 tags allowed",
      });
    }

    const blogId = title.toLowerCase().replace(/ +/g, "-") + "-" + randomUUID();

    const blog = await Blog.create({
      title,
      description,
      draft,
      creator,
      image: secure_url,
      imageId: public_id,
      blogId,
      content,
      tags,
    });

    await User.findByIdAndUpdate(creator, { $push: { blogs: blog._id } });

    if (draft) {
      return res.status(200).json({
        success: true,
        message: "Blog saved as draft. You can public it from your profile.",
        blog,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: err.message,
    });
  }
}

async function getBlogs(req, res) {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const totalBlogs = await Blog.countDocuments({ draft: false });

    const blogs = await Blog.find({ draft: false })
      .populate({
        path: "creator",
        select: "-password",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Blogs fetched Successfully.",
      blogs,
      hasMore: skip + limit < totalBlogs,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: err.message,
    });
  }
}

async function getBlog(req, res) {
  try {
    const { blogId } = req.params;

    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid user ID",
    //   });
    // }

    const blog = await Blog.findOne({ blogId })
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "creator",
        select: "name email followers username profilePic",
      })
      .lean();

    async function populateReplies(comments) {
      for (const comment of comments) {
        let populatedComment = await Comment.findById(comment._id)
          .populate({
            path: "replies",
            populate: {
              path: "user",
              select: "name email",
            },
          })
          .lean();
        comment.replies = populatedComment.replies;
        if (comment.replies.length > 0) {
          await populateReplies(comment.replies);
        }
      }
      return comments;
    }

    blog.comments = await populateReplies(blog.comments);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog fetched Successfully",
      blog,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: err.message,
    });
  }
}

async function updateBlog(req, res) {
  try {
    const creator = req.user;
    const { id } = req.params;

    const { title, description } = req.body;
    const draft = req.body.draft === "true";
    const image = req.files.image;
    const images = req.files.images || [];
    const content = JSON.parse(req.body.content);
    const existingImages = JSON.parse(req.body.existingImages);
    let tags;

    const blog = await Blog.findOne({ blogId: id });

    if (!blog) {
      return res.status(500).json({
        success: false,
        message: "Blog not found",
      });
    }

    if (creator != blog.creator) {
      return res.status(500).json({
        success: false,
        message: "You are not authorized for this action",
      });
    }

    try {
      tags = JSON.parse(req.body.tags);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid tags format",
      });
    }

    if (!Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: "Tags must be an array",
      });
    }

    let imagesToDelete = blog.content.blocks
      .filter((block) => block.type == "image")
      .filter(
        (block) =>
          !existingImages.find(({ url }) => url == block.data.file.url),
      )
      .map((block) => block.data.file.imageId);

    if (images) {
      let imageIndex = 0;
      for (let i = 0; i < content.blocks.length; i++) {
        const block = content.blocks[i];
        if (block.type === "image" && block.data.file.image) {
          const { secure_url, public_id } = await uploadImage(
            `data:image/jpeg;base64,${images[imageIndex].buffer.toString(
              "base64",
            )}`,
          );
          block.data.file = {
            url: secure_url,
            imageId: public_id,
          };
          imageIndex++;
        }
      }
    }

    tags = tags
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);

    tags = [...new Set(tags)];

    if (tags.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 tags allowed",
      });
    }

    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.draft = typeof draft === "boolean" ? draft : blog.draft;
    blog.content = content || blog.content;

    if (tags.length > 0) {
      blog.tags = tags;
    }

    if (image) {
      await deleteImageFromCloudinary(blog.imageId);
      const { secure_url, public_id } = await uploadImage(
        `data:image/jpeg;base64,${image[0].buffer.toString("base64")}`,
      );
      blog.image = secure_url;
      blog.imageId = public_id;
    }

    if (title && title !== blog.title) {
      blog.blogId =
        title.toLowerCase().replace(/ +/g, "-") + "-" + randomUUID();
    }

    await blog.save();

    if (draft) {
      return res.status(200).json({
        success: true,
        message: "Blog saved as draft. You can public it from your profile.",
        blog,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: err.message,
    });
  }
}

async function deleteBlog(req, res) {
  try {
    const userId = req.user;
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    if (userId != blog.creator) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this blog",
      });
    }

    await User.updateMany(
      { likeBlogs: blog._id },
      { $pull: { likeBlogs: blog._id } },
    );

    await User.updateMany(
      { saveBlogs: blog._id },
      { $pull: { saveBlogs: blog._id } },
    );

    await User.findByIdAndUpdate(blog.creator, {
      $pull: { blogs: blog._id },
    });

    await Comment.deleteMany({ blog: blog._id });

    if (blog.imageId) {
      await deleteImageFromCloudinary(blog.imageId);
    }

    const imageBlocks = blog.content.blocks.filter(
      (block) => block.type === "image" && block.data?.file?.imageId,
    );

    await Promise.all(
      imageBlocks.map((block) =>
        deleteImageFromCloudinary(block.data.file.imageId),
      ),
    );

    await Blog.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete blog",
      error: err.message,
    });
  }
}

async function likeBlog(req, res) {
  try {
    const user = req.user;
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(500).json({
        success: false,
        message: "Blog not found",
      });
    }

    if (!blog.likes.includes(user)) {
      await Blog.findByIdAndUpdate(id, { $push: { likes: user } });
      await User.findByIdAndUpdate(user, { $push: { likeBlogs: id } });

      return res.status(200).json({
        success: true,
        message: "Blog liked successfully",
        isLiked: true,
      });
    } else {
      await Blog.findByIdAndUpdate(id, { $pull: { likes: user } });
      await User.findByIdAndUpdate(user, { $pull: { likeBlogs: id } });

      return res.status(200).json({
        success: true,
        message: "Blog disliked successfully",
        isLiked: false,
      });
    }
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: err.message,
    });
  }
}

async function saveBlog(req, res) {
  try {
    const id = req.params.id;
    const user = req.user;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    if (!blog.totalSaves.includes(user)) {
      await User.findByIdAndUpdate(
        user,
        { $addToSet: { saveBlogs: id } },
        { new: true },
      );
      await Blog.findByIdAndUpdate(
        id,
        { $addToSet: { totalSaves: user } },
        { new: true },
      );

      return res.status(200).json({
        success: true,
        message: "Blog saved successfully",
      });
    } else {
      await User.findByIdAndUpdate(
        user,
        { $pull: { saveBlogs: id } },
        { new: true },
      );
      await Blog.findByIdAndUpdate(
        id,
        { $pull: { totalSaves: user } },
        { new: true },
      );

      return res.status(200).json({
        success: true,
        message: "Blog unsaved successfully",
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: error.message,
    });
  }
}

async function searchBlogs(req, res) {
  try {
    const { search, tag } = req.query;

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    let q;

    if (tag) {
      q = { tags: tag };
    } else {
      q = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    const blogs = await Blog.find(q, { draft: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (blogs.length == 0) {
      return res.status(400).json({
        success: false,
        message:
          "Make sure all words are spelled correctly. Try different keywords. Try more general keywords.",
        hasMore: false,
      });
    }

    const totalBlogs = await Blog.find(q, { draft: false });

    return res.status(200).json({
      success: true,
      message: "Blogs fetched Successfully.",
      blogs,
      hasMore: skip + limit < totalBlogs.length,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: err.message,
    });
  }
}

async function getTopTags(req, res) {
  try {
    const tags = await Blog.aggregate([
      { $match: { draft: false } },

      { $unwind: "$tags" },

      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },

      { $sort: { count: -1 } },

      { $limit: 10 },

      {
        $project: {
          _id: 0,
          tag: "$_id",
          count: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      tags,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Can't fetch top tags",
      err: error.message,
    });
  }
}

module.exports = {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  saveBlog,
  searchBlogs,
  getTopTags,
};
