const mongoose = require('mongoose');

const exampleSchema = mongoose.Schema({
  // _id: { type: mongoose.Schema.Types.ObjectId, index: true, required: true },
  dateAdded: { type: Date, default: Date.now },
  date: { type: Date, index: true }, // date of Tweet/incident/example
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true, index: true },
  keywordIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Keyword' }],
  text: { type: String, required: true, default: "" },
  source: { type: Boolean, default: false },
  sourceText: { type: String, default: "" },
  standalonetweets: [String],
  thenVsNowFormat: { type: Boolean, default: false }, // is this a then vs. now format, or an us vs. them formula?
  thereVsHereFormat: { type: Boolean, default: false }, // is this a there vs. here format, or an us vs. them formula?
  thereTweets: [String], // for new Nazis (comparing Houthis giving Nazi salute to antizionists praising Houthis)
  hereTweets: [String], // for new Nazis (comparing Houthis giving Nazi salute to antizionists praising Houthis)
  thenTweets: [String], // for rhetorical games
  nowTweets: [String], // for rhetorical games
  themTweets: [String],
  usTweets: [String]
});

module.exports = mongoose.model('Example', exampleSchema);