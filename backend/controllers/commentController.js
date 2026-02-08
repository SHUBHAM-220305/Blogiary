const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");

async function commentBlog(req, res) {
  try {
    const creator = req.user;
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(500).json({
        success: false,
        message: "Please enter the comment",
      });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(500).json({
        success: false,
        message: "Blog not found",
      });
    }

    const newComment = await Comment.create({
      comment,
      blog: id,
      user: creator,
    }).then((comment) => {
      return comment.populate({
        path: "user",
        select: "name email",
      });
    });

    await Blog.findByIdAndUpdate(id, { $push: { comments: newComment._id } });

    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
      newComment,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: err.message,
    });
  }
}

async function deleteComment(req, res) {
  try {
    const userId = req.user;
    const { id } = req.params;

    const comment = await Comment.findById(id).populate({
      path: "blog",
      select: "creator",
    });

    if (!comment) {
      return res.status(500).json({
        success: false,
        message: "Comment not found.",
      });
    }

    if (comment.user != userId && comment.blog.creator != userId) {
      return res.status(500).json({
        success: false,
        message: "You are not authorized.",
      });
    }

    async function deleteCommentAndReplies(id) {
      let comment = await Comment.findById(id);
      if (!comment) return;
      for (let replyId of comment.replies) {
        await deleteCommentAndReplies(replyId);
      }
      await Comment.findByIdAndDelete(id);
    }

    await deleteCommentAndReplies(id);

    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: id },
      });
    } else {
      await Blog.findByIdAndUpdate(comment.blog._id, {
        $pull: { comments: id },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: err.message,
    });
  }
}

async function editComment(req, res) {
  try {
    const userId = req.user;
    const { id } = req.params;
    const { updatedCommentContent } = req.body;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(500).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.user != userId) {
      return res.status(400).json({
        success: false,
        message: "You are not authorized to edit this comment.",
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      {
        comment: updatedCommentContent,
      },
      { new: true },
    ).then((comment) => {
      return comment.populate({
        path: "user",
        select: "name email",
      });
    });

    return res.status(200).json({
      success: true,
      message: "Comment edited successfully",
      updatedComment,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: err.message,
    });
  }
}

async function likeComment(req, res) {
  try {
    const userId = req.user;
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(500).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (!comment.likes.includes(userId)) {
      await Comment.findByIdAndUpdate(id, { $push: { likes: userId } });

      return res.status(200).json({
        success: true,
        message: "Comment liked successfully",
      });
    } else {
      await Comment.findByIdAndUpdate(id, { $pull: { likes: userId } });

      return res.status(200).json({
        success: true,
        message: "Comment disliked successfully",
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

async function addNestedComment(req, res) {
  try {
    const userId = req.user;
    const { id, parentCommentId } = req.params;

    const comment = await Comment.findById(parentCommentId);
    const blog = await Blog.findById(id);
    const { reply } = req.body;

    if (!comment) {
      return res.status(500).json({
        success: false,
        message: "Parent comment not found",
      });
    }

    if (!blog) {
      return res.status(500).json({
        success: false,
        message: "Blog not found",
      });
    }

    const newReply = await Comment.create({
      comment: reply,
      blog: id,
      user: userId,
      parentComment: parentCommentId,
    }).then((reply) => {
      return reply.populate({
        path: "user",
        select: "name email",
      });
    });

    await Comment.findByIdAndUpdate(parentCommentId, {
      $push: { replies: newReply._id },
    });

    return res.status(200).json({
      success: true,
      message: "Reply added successfully",
      newReply,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Please try again",
      error: err.message,
    });
  }
}

module.exports = {
  commentBlog,
  deleteComment,
  editComment,
  likeComment,
  addNestedComment,
};
