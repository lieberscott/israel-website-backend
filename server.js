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
const examples = [examples1, examples2, examples3, examples4, examples5, examples6];


const Claim = require('./schemas/claim.js');
const Keyword = require("./schemas/keyword.js");
const Example = require('./schemas/example.js');
const Tweet = require('./schemas/tweet.js');


// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/israel", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.post("/fetch_month", async (req, res) => {
  const dateString = req.body.dateString;
  const summaryOnly = req.body.summaryOnly; // only include the count, not the full records, for when a user clicks through the calendar months


  // Get start date and end date
  const [year, month] = dateString.split('-');
  const startDate = new Date(`${year}-${month}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() + 1); // adds one extra day to avoid time zone issues that would cut off the ends of months

  try {

    // Always build the summary via aggregation
    const summaryResults = await Example.aggregate([
      { $match: { date: { $gte: startDate, $lt: endDate } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Group by date
    /*
      {
        "2025-09-01": 3,
        "2025-09-02": 5,
        "2025-09-03": 2
      }
    */
    const summaryData = summaryResults.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    // Optionally include full records if summaryOnly is false
    let data = {};
    if (!summaryOnly) {
      const examples = await Example.find({ date: { $gte: startDate, $lt: endDate } });

      // Group by date (YYYY-MM-DD)
      /*
        Will look like this:
        {
          "2025-09-30": [ { ... }, { ... } ],
          "2025-10-01": [ { ... } ]
        }
      */
      data = examples.reduce((acc, ex) => {
        const day = ex.date.toISOString().split('T')[0];
        if (!acc[day]) acc[day] = [];
        acc[day].push(ex);
        return acc;
      }, {});
    }

    return res.json({ summaryData, data: summaryOnly ? null : data });
  }

  catch (e) {
    console.log(e);
    return res.json({ error: true });
  }

})




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
