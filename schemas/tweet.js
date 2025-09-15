const mongoose = require('mongoose');

const userSchema = require("./user.js");
const exampleSchema = require("./example.js");

const tweetSchema = mongoose.Schema({
  created_at: { type: String, required: true },
  tweet_id: { type: String, required: true, unique: true, index: true },
  conversation_id: { type: String, required: true },
  text: { type: String, required: true },
  user: userSchema,
  image_urls: [
    {
      media_key: { type: String },
      height: { type: Number },
      type: { type: String },
      width: { type: Number },
      url: { type: String }
    }
  ],
  thread_arr: [
    {
      created_at: { type: Date },
      id: { type: String },
      conversation_id: { type: String },
      text: { type: String },
      tweet_url: { type: String }
    }
  ],
  video: { type: Boolean, required: true, default: false },
  tweet_url: { type: String, required: true },
  quoted: { type: Boolean, required: true, default: false },
  reply: { type: Boolean, required: true, default: false },
  thread: { type: Boolean, required: true, default: false },
  video_html: { type: String }
});

tweetSchema.add({
  quoted_tweet_data: {
    type: mongoose.Schema.Types.Mixed,
    required: () => this.quoted === true
  },
  in_reply_to_data: {
    type: mongoose.Schema.Types.Mixed,
    required: () => this.quoted === true
  },
});

module.exports = mongoose.model('Tweet', tweetSchema);