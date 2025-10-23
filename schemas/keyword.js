const mongoose = require('mongoose');

const keywordSchema = mongoose.Schema({
  // _id: { type: mongoose.Schema.Types.ObjectId, index: true, required: true },
  keyword: { type: String, required: true },
  keywordText: { type: String, required: true, default: "" }, // this is something like "EmmanuelMacron" in order to map (before knowing the keyword's _id) to Examples
  exampleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Example' }]
});

module.exports = mongoose.model('Keyword', keywordSchema);