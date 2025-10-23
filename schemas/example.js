const mongoose = require('mongoose');

const exampleSchema = mongoose.Schema({
  // _id: { type: mongoose.Schema.Types.ObjectId, index: true, required: true },
  dateAdded: { type: Date, default: Date.now },
  date: { type: Date, index: true }, // date of Tweet/incident/example
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true },
  keywordIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Keyword' }],
  text: { type: String, required: true, default: "" },
  themTweets: [{ id: String }],
  usTweets: [{ id: String }]
});

module.exports = mongoose.model('Example', exampleSchema);