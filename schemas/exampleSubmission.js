const mongoose = require('mongoose');

const exampleSubmissionSchema = mongoose.Schema({
  // _id: { type: mongoose.Schema.Types.ObjectId, index: true, required: true },
  dateAdded: { type: Date, default: Date.now },
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true, index: true },
  claimText: { type: String, required: true },
  explanation: { type: String, required: true, default: "" },
  themTweets: [{ id: String }],
  usTweets: [{ id: String }]
});

module.exports = mongoose.model('ExampleSubmission', exampleSubmissionSchema);