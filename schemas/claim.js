const mongoose = require('mongoose');

const claimSchema = mongoose.Schema({
  // _id: { type: mongoose.Schema.Types.ObjectId, index: true, required: true },
  dateAdded: { type: Date, default: Date.now },
  claimText: { type: String, required: true },
  claimShortText: { type: String, required: true },
  exampleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Example' }]
});

module.exports = mongoose.model('Claim', claimSchema);