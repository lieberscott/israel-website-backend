const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  screen_name: { type: String, required: true },
  profile_page_url: { type: String, required: true },
  profile_image_url: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verified_type: { type: String, default: "none" }
}, {_id: false});

module.exports = userSchema;