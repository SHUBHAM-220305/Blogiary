import { createSlice } from "@reduxjs/toolkit";

let initialState = {};

try {
  const storedBlog = localStorage.getItem("selectedBlog");
  if (storedBlog) {
    initialState = JSON.parse(storedBlog);
  }
} catch (err) {
  console.error("Invalid blog data in localStorage. Resetting...", err);
  localStorage.removeItem("selectedBlog");
}

const selectedBlogSlice = createSlice({
  name: "selectedBlogSlice",
  initialState: {},
  reducers: {
    addSelectedBlog(state, action) {
      localStorage.setItem("selectedBlog", JSON.stringify(action.payload));
      return action.payload;
    },

    removeSelectedBlog(state, action) {
      localStorage.removeItem("selectedBlog");
      return {};
    },

    changeLikes(state, action) {
      if (state.likes.includes(action.payload)) {
        state.likes = state.likes.filter((like) => like != action.payload);
      } else {
        state.likes = [...state.likes, action.payload];
      }
      return state;
    },

    toggleSave: (state, action) => {
      const userId = action.payload;
      const index = state.totalSaves.indexOf(userId);
      if (index === -1) state.totalSaves.push(userId);
      else state.totalSaves.splice(index, 1);
    },

    setComments(state, action) {
      state.comments = [...state.comments, action.payload];
    },

    setCommentLikes(state, action) {
      const { commentId, userId } = action.payload;

      function toggleLike(comments) {
        return comments.map((comment) => {
          if (comment._id === commentId) {
            const liked = comment.likes.includes(userId);

            return {
              ...comment,
              likes: liked
                ? comment.likes.filter((id) => id !== userId)
                : [...comment.likes, userId],
            };
          }

          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: toggleLike(comment.replies),
            };
          }

          return comment;
        });
      }

      state.comments = toggleLike(state.comments);
    },

    setReplies(state, action) {
      let newReply = action.payload;

      function findParentComment(comments) {
        let parentComment;

        for (const comment of comments) {
          if (comment._id === newReply.parentComment[0]) {
            parentComment = {
              ...comment,
              replies: [...comment.replies, newReply],
            };
            break;
          }

          if (comment.replies.length > 0) {
            parentComment = findParentComment(comment.replies);
            if (parentComment) {
              parentComment = {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply._id == parentComment._id ? parentComment : reply,
                ),
              };
              break;
            }
          }
        }

        return parentComment;
      }

      let parentComment = findParentComment(state.comments);
      state.comments = state.comments.map((comment) =>
        comment._id == parentComment._id ? parentComment : comment,
      );
    },

    setUpdatedComments(state, action) {
      function updateComment(comments) {
        return comments.map((comment) =>
          comment._id == action.payload._id
            ? { ...comment, comment: action.payload.comment }
            : comment.replies && comment.replies.length > 0
              ? { ...comment, replies: updateComment(comment.replies) }
              : comment,
        );
      }
      state.comments = updateComment(state.comments);
    },

    deleteCommentAndReply(state, action) {
      function deleteComment(comments) {
        return comments
          .filter((comment) => comment._id !== action.payload)
          .map((comment) =>
            comment.replies && comment.replies.length > 0
              ? { ...comment, replies: deleteComment(comment.replies) }
              : comment,
          );
      }
      state.comments = deleteComment(state.comments);
    },
  },
});

export const {
  addSelectedBlog,
  removeSelectedBlog,
  changeLikes,
  setComments,
  setCommentLikes,
  setReplies,
  setUpdatedComments,
  deleteCommentAndReply,
  toggleSave,
} = selectedBlogSlice.actions;
export default selectedBlogSlice.reducer;
