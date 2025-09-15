const mongoose = require('mongoose');

const keywordSchema = mongoose.Schema({
  keyword: { type: String, required: true },
  // _id: { type: mongoose.Schema.ObjectId, required: true, index: true },
  example_ids: [mongoose.Schema.ObjectId]
});

module.exports = mongoose.model('Keyword', keywordSchema);