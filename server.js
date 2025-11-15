const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();

// const { ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const Claim = require('./schemas/claim.js');
const Keyword = require("./schemas/keyword.js");
const Example = require('./schemas/example.js');
const Tweet = require('./schemas/tweet.js');

const authenticationAPI = require("./server_testAPI.js");
app.use(authenticationAPI);


// Connect to MongoDB
mongoose.connect(process.env.MONGO_LOCAL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.post("/fetch_month", async (req, res) => {
  const { dateString, summaryOnly, keywordId, claimId, findNext, findPrev, findFirst } = req.body;

  // Get start date and end date
  const [year, month] = dateString.split('-');
  const startDate = new Date(`${year}-${month}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() + 1); // adds one extra day to avoid time zone issues that would cut off the ends of months


  const summaryMatchObj = { date: { $gte: startDate, $lt: endDate } };

  const matchQuery = { date: { $gte: startDate, $lt: endDate } };

  if (keywordId) {
    summaryMatchObj.keywordIds = mongoose.Types.ObjectId.createFromHexString(keywordId);
    matchQuery.keywordIds = mongoose.Types.ObjectId.createFromHexString(keywordId);
  }

  if (claimId) {
    summaryMatchObj.claimId = mongoose.Types.ObjectId.createFromHexString(claimId);
    matchQuery.claimId = mongoose.Types.ObjectId.createFromHexString(claimId);
  }

  const summaryQuery = [
    { $match: summaryMatchObj },
    { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]

  try {

    const [summaryData, data] = await getMonth(summaryQuery, matchQuery, summaryOnly);

    return res.json({ summaryData, data: summaryOnly ? null : data });
  }

  catch (e) {
    console.log(e);
    return res.json({ error: true });
  }

});


app.post("/fetch_next", async (req, res) => {
  const { dateString, summaryOnly, keywordId, claimId, findNext, findPrev, findFirst } = req.body;

  const baseDate = findFirst ? new Date("1900-01-01") : new Date(dateString);
  

  try {

    // Step 1: Find the next or previous date that has any Example
    const query = {
      ...(findNext
        ? { date: { $gt: baseDate } } // next date after baseDate
        : { date: { $lt: baseDate } }), // previous date before baseDate
      ...(keywordId && { keywordIds: keywordId }),
      ...(claimId && { claimId }),
    };

    const sortOrder = findPrev ? -1 : 1; // ascending for next, descending for previous
    
    const targetExample = await Example.findOne(query, null, { sort: { date: sortOrder } });

    if (!targetExample) {
      return res.json({ noTarget: true });
    }

    // Step 2: Compute month range based on targetExample.date
    const nextDate = new Date(targetExample.date);
    const startDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
    const endDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 1);

    // Step 3: Query all examples for that month
    const matchQuery = {
      date: { $gte: startDate, $lt: endDate },
      ...(keywordId && { keywordIds: keywordId }),
      ...(claimId && { claimId })
    };

    const [summaryData, data] = await getMonth({}, matchQuery, summaryOnly);

    res.json({
      nextDate: nextDate.toISOString().split('T')[0],
      data,
      summaryData
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }

});



app.post("/fetch_claim", async (req, res) => {
  const { dateString, summaryOnly, keywordId, claimId, findNext, findPrev, findFirst } = req.body.dateString;
  const baseDate = new Date(dateString);

  try {

    // Step 1: Find the next or previous date that has any Example
    const query = {
      ...(findNext
        ? { date: { $gt: baseDate } } // next date after baseDate
        : { date: { $lt: baseDate } }), // previous date before baseDate
      ...(keywordId && { keywordIds: keywordId }),
      ...(claimId && { claimId }),
    };

    const sortOrder = findNext ? 1 : -1; // ascending for next, descending for previous
    
    const targetExample = await Example.findOne(query, null, { sort: { date: sortOrder } });

    if (!targetExample) {
      return res.json({ noTarget: true });
    }

    // Step 2: Compute month range based on targetExample.date
    const nextDate = new Date(targetExample.date);
    const startDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
    const endDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 1);

    // Step 3: Query all examples for that month
    const matchQuery = {
      date: { $gte: startDate, $lt: endDate },
      ...(keywordId && { keywordIds: keywordId }),
      ...(claimId && { claimId })
    };

    const [summaryData, data] = await getMonth({}, matchQuery, summaryOnly);

    res.json({
      nextDate: nextDate.toISOString().split('T')[0],
      data,
      summaryData
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }

});


const getMonth = async (summaryQuery, examplesQuery, summaryOnly) => {

  if (summaryOnly) {
    // Always build the summary via aggregation
    const summaryResults = await Example.aggregate(summaryQuery);

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

    return [summaryData, null];

  }

  else {
    // Do a full Examples search, then build summary from them
    const examplesResponse = await Example.find(examplesQuery).populate('claimId', 'claimText'); // pull in claimText from claimIds on Examples

    // flatten claimText so claimText is at the top level, not nested
    const examples = examplesResponse.map(ex => ({
      ...ex.toObject(),
      claimText: ex.claimId?.claimText || null
    }));

    // Group by date (YYYY-MM-DD)
    /*
      Will look like this:
      {
        "2025-09-30": [ { ... }, { ... } ],
        "2025-10-01": [ { ... } ]
      }
    */
    const data = examples.reduce((acc, ex) => {
      const day = ex.date.toISOString().split('T')[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(ex);
      return acc;
    }, {});


    // Build daily summary
    const grouped = examples.reduce((acc, ex) => {
      const day = ex.date.toISOString().split('T')[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(ex);
      return acc;
    }, {});
  
    const summaryData = Object.fromEntries(
      Object.entries(grouped).map(([date, items]) => [date, items.length])
    );

    return [summaryData, data];
  }
}



app.listen(5000, () => console.log("Server running on port 5000"));
