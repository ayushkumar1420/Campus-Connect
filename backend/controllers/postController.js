const Post = require('../models/Post');
const sendServerError = require('../utils/sendServerError');

async function getPosts(req, res) {
  try {
    const posts = await Post.find({ college_name: req.user.college_name })
      .populate('user_id', 'name avatar_url college_name')
      .sort({ created_at: -1 });

    const feed = posts.map((post) => ({
      id: post._id.toString(),
      user_id: post.user_id?._id.toString() || null,
      content: post.content,
      type: post.type,
      created_at: post.created_at,
      college_name: post.college_name,
      profiles: {
        name: post.user_id?.name || 'Unknown',
        avatar_url: post.user_id?.avatar_url || '',
        college_name: post.user_id?.college_name || 'Unknown',
      },
    }));

    return res.json(feed);
  } catch (error) {
    return sendServerError(res, error);
  }
}

async function createPost(req, res) {
  const { content, type = 'general' } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Post content is required.' });
  }

  try {
    const post = await Post.create({
      user_id: req.user.id,
      college_name: req.user.college_name,
      content,
      type,
    });

    return res.status(201).json({ message: 'Post created.', id: post._id.toString() });
  } catch (error) {
    return sendServerError(res, error);
  }
}

async function getProfileStats(req, res) {
  try {
    const posts = await Post.find({ user_id: req.user.id }).select('type');
    return res.json({ posts });
  } catch (error) {
    return sendServerError(res, error);
  }
}

module.exports = {
  getPosts,
  createPost,
  getProfileStats,
};
