const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// const calendarData = require("../israel_website_v2/tweets_new_design_0/calendarData.js");
const { claim1, examples1 } = require("../israel_website_v2/tweets_new_design_0/1_hypocrisy.js");
const { claim2, examples2 } = require("../israel_website_v2/tweets_new_design_0/2_intLaw.js");
const { claim3, examples3 } = require("../israel_website_v2/tweets_new_design_0/3_palEvil.js");
const { claim4, examples4 } = require("../israel_website_v2/tweets_new_design_0/4_lies.js");
const { claim5, examples5 } = require("../israel_website_v2/tweets_new_design_0/5_palWar.js");
const { claim6, examples6 } = require("../israel_website_v2/tweets_new_design_0/6_ngos.js");
const { keywords } = require("../israel_website_v2/tweets_new_design_0/keywords.js");

const claims = [claim1, claim2, claim3, claim4, claim5, claim6];
const examples = [examples1];


const Claim = require('./schemas/claim.js');
const Keyword = require("./schemas/keyword.js");
const Example = require('./schemas/example.js');
const Tweet = require('./schemas/tweet.js');


// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/israel", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.post("/fetch_date", async (req, res) => {
  const date = req.body.date;

  // Get examples
  const items = await Example.find({ date })


})

// Test route
app.post("/fetch_example", async (req, res) => {

  const category = req.body.cat;
  console.log("category :", category);
  const getCount = req.body.getCount;

  const item = await Example.aggregate([
    { $match: { category } },  // Filter by category
    { $sample: { size: 1 } },  // Pick 1 random document
  ]);

  let count = -1;

  if (getCount) {
    count = await Example.countDocuments({ category });
  }


  return res.json({ item, count, status: 200 });
});


app.post("/fetch_tweets", async (req, res) => {

  const themTweetIds = req.body.themTweetIds;
  const usTweetIds = req.body.usTweetIds;
  const allTweetIds = themTweetIds.concat(usTweetIds);

  const items = await Tweet.find({
    tweet_id: { $in: allTweetIds }
  });

  // Filter back into themTweets and usTweets
  const themTweets = items.filter(i => themTweetIds.includes(i.tweet_id));
  const usTweets = items.filter(i => usTweetIds.includes(i.tweet_id));

  return res.json({ themTweets, usTweets, status: 200 });

});

app.post("/addlocally", async (req, res) => {
  
  // const example = req.body.example;

  try {
    // Step 0: Add the keywords
    const keywordsResponse = await Keyword.insertMany(keywords);
  
    // Step 1: Add the Claims
    const claimsResponse = await Claim.insertMany(claims);

    // Step 2: Add keyword_ids and claim_ids to Examples
    for (let i = 0; i < examples.length; i++) {
      for (let j = 0; j < examples[i].length; j++) {
        // Add claimIds to Examples
        examples[i][j].claimId = claimsResponse[i]._id; // ObjectId for 'All they do is lie' is assigned as claimsId to all Examples that fall under that claim
        // Add keywordIds to Examples
        const exampleKeywords = examples[i][j].keywordIds;
        for (let k = 0; k < exampleKeywords.length; k++) {
          for (l = 0; l < keywordsResponse.length; l++) {
            if (exampleKeywords[k] == keywordsResponse[l].keywordText) {
              examples[i][j].keywordIds[k] = keywordsResponse[l]._id;
            }
          }
        }
      }
    }

    let examplesResponse = [];

    // Step 3: Add the Examples
    for (let i = 0; i < examples.length; i++) {
      const response = await Example.insertMany(examples[i]);
      examplesResponse.push(response);
    }


    // Step 4: Add ExampleIds back to Claims and Keywords
    for (let i = 0; i < examplesResponse.length; i++) {
      for (let j = 0; j < examplesResponse[i].length; j++) {
        // Find their claimId and add exampleId to the claim
        const claimId = examplesResponse[i][j].claimId;
        const exampleId = examplesResponse[i][j]._id;

        await Claim.findByIdAndUpdate(claimId, { $push: { exampleIds: exampleId } })

        // Find their keywords and add exampleId to keyword
        const keywordIdsArr = examplesResponse[i][j].keywordIds;
        for (let k = 0; k < keywordIdsArr.length; k++) {
          const keywordId = keywordIdsArr[k];
          await Keyword.findByIdAndUpdate(keywordId, { $push: { exampleIds: exampleId }})
        }
      }
    }
  }

  catch (e) {
    console.log(e);
    return res.json({ error: true });
  }

  return res.json({ ok: true });

});

app.listen(5000, () => console.log("Server running on port 5000"));
