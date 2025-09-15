const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const Example = require('./schemas/example.js');
const Tweet = require('./schemas/tweet.js');


// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/israel", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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

app.post("/test", async (req, res) => {
  
  const example = req.body.example;
  const tweets = req.body.tweets;
  
  try {
    const exampleRes = await Example.create(example);
    const tweetRes1 = await Tweet.create(tweets[0]);
    const tweetRes2 = await Tweet.create(tweets[1]);
    return res.json({success: true});
  }
  catch (e) {
    console.log("error : ", e);
    return res.json({ error: true});
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
