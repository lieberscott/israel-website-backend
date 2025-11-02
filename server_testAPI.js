const express = require("express");
const router = express.Router();
// const fetch = require('node-fetch');
const mongoose = require("mongoose");
require('dotenv').config();
const nodemailer = require('nodemailer');
const { ObjectId } = require('mongodb');

const Example = require('./schemas/example.js');
const Keyword = require('./schemas/keyword.js');
const Claim = require('./schemas/claim.js');
const ExampleSubmission = require('./schemas/exampleSubmission.js');

// const calendarData = require("../israel_website_v2/tweets_new_design_0/calendarData.js");
const { claim1, examples1 } = require("./tweets/1_hypocrisy.js");
const { claim2, examples2 } = require("./tweets/2_intLaw.js");
const { claim3, examples3 } = require("./tweets/3_palEvil.js");
const { claim4, examples4 } = require("./tweets/4_lies.js");
const { claim5, examples5 } = require("./tweets/5_palWar.js");
const { claim6, examples6 } = require("./tweets/6_ngos.js");
const { keywords } = require("./tweets/keywords.js");

const claims = [claim1, claim2, claim3, claim4, claim5, claim6];
const examples = [examples1, examples2, examples3, examples4, examples5, examples6];


router.post("/addlocally", async (req, res) => {

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


router.get("/getclaims", async (req, res) => {

  try {

    // Step 1: Get the Claims
    const claims = await Claim.get({});

    return res.json({ data: claims });

  }

  catch (e) {
    console.log(e);
    return res.json({ error: true });
  }

});

router.get("/getkeywords", async (req, res) => {

  try {
  
    // Step 1: Get the Keywords
    const keywords = await Keyword.get({});

    return res.json({ data: keywords });

  }

  catch (e) {
    console.log(e);
    return res.json({ error: true });
  }

});


router.post("/submit_example", async (req, res) => {

  const { claimId, claimText, explanation, themTweets, usTweets } = req.body;

  try {
  
    const newClaimId = new ObjectId.createFromHexString(claimId);
    const submissionObj = {
      claimId: newClaimId,
      claimText,
      explanation,
      themTweets,
      usTweets
    }

    const responseData = await ExampleSubmission.create(submissionObj);

    const transporter = nodemailer.createTransport({
      service: 'gmail', // or use host/port/auth for custom SMTP
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // use an App Password, not your real password
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USSER,
      subject: 'New submission for Israel website',
      text: JSON.stringify(submissionObj)
    });
    res.send('Email sent successfully!');

    // Step 1: Get the Keywords
    return res.json({ ok: true });

  }

  catch (e) {
    console.log(e);
    return res.json({ error: true });
  }

});


module.exports = router;