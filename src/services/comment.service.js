const Comment = require("../models/Comment.model");

const createComment = async (commentBody) => {
  const comment = await Comment.create(commentBody);
  await comment.populate([
    {
      path: "userId",
      select: { id: 1, name: 1 },
    },
    {
      path: "parentCommentId",
      select: { _id: 0, userId: 1 },
      populate: {
        path: "userId",
        select: { id: 1, name: 1 },
      },
    },
  ]);
  return comment;
};

const getCommentByPostId = async (postId) => {
  const parentComment = await Comment.find({
    postId: postId,
    parentCommentId: null,
  })
    .sort({ createdAt: "desc" })
    .select("_id userId like content parentCommentId createdAt")
    .populate([
      {
        path: "userId",
        select: { id: 1, name: 1, image: 1 },
      },
    ]);
  // hàm lấy các comment con có parentCommentId bằng id comment truyền vào
  const repliesComment = async (commentId) => {
    // lấy comments con từ db
    const childComments = await Comment.find({
      parentCommentId: commentId,
    })
      .sort({ createdAt: "asc" })
      .select("_id userId like content parentCommentId createdAt")
      .populate([
        {
          path: "userId",
          select: { id: 1, name: 1, image: 1 },
        },
        {
          path: "parentCommentId",
          select: { _id: 0, userId: 1 },
          populate: {
            path: "userId",
            select: { id: 1, name: 1, image: 1 },
          },
        },
      ]);
    const dataReplies = [];
    // dùng for of để lấy các comments
    for (const comment of childComments) {
      dataReplies.push({ ...comment.toObject() });
      // dùng đệ quy gọi lại chính nó
      const data = await repliesComment(comment._id);
      // push vào mảng
      dataReplies.push(...data);
    }
    return dataReplies;
  };

  const dataComments = [];
  // dùng for of để lấy các comments
  for (const comment of parentComment) {
    const data = await repliesComment(comment._id);
    dataComments.push({ ...comment.toObject(), replies: data });
  }
  return dataComments;
};

const getCommentById = async (id) => {
  return Comment.findById(id);
};

const updateComment = async (commentId, updateBody) => {
  const comment = await getCommentById(commentId);
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Không tìm thấy bình luận");
  }
  Object.assign(comment, updateBody);
  await comment.save();
  return comment;
};

const deleteComment = async (commentId) => {
  const deletedCommentChild = async (id) => {
    const childComment = await Comment.find({ parentCommentId: id });
    for (const comment of childComment) {
      await deletedCommentChild(comment._id);
    }
    await Comment.deleteOne({ _id: id });
  };

  deletedCommentChild(commentId);
};
const commentService = {
  createComment,
  getCommentByPostId,
  updateComment,
  deleteComment,
};

module.exports = commentService;
