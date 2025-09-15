const mongoose = require('mongoose');

const exampleSchema = mongoose.Schema({
  // category_id: { type: mongoose.Schema.ObjectId, index: true, required: true },

  category: { type: String, required: true },
  claim: { type: String, required: true },
  incident: { type: String, required: true },
  incident_id: { type: String, required: true },
  example: { type: String, required: true },
  explanation: { type: String, required: true },
  them_tweet_ids: [{ type: String, required: true }],
  us_tweet_ids: [{ type: String, required: true }]
});

module.exports = mongoose.model('Example', exampleSchema);