const claim2 = {
  dateAdded: "",
  claimText: "'Fake inteernational law': Israel is routinely accused of violating international law when it does not",
  claimShortText: "Fake International Law Violations",
  claimId: "000000002",
  incidentIds: [{ incidentId: "00000000X", exampleId: "00000000C" }]
}

const examples2 = [
  {
    dateAdded: "",
    date: "2025-02-01",
    claimId: "00000002",
    incidentId: "00000000X",
    exampleId: "00000000D",
    keywordIds: ["UnitedNations", "AntonioGuterres"],
    text: "Israel acted in accordance with international law when it attacked Hamas leaders in Qatar, same when America killed Osama bin Laden in Pakistan. But when it comes to Israel, it's a violation of international law.",
    themTweets: [{id: "1967914750320181648"}, { id: "1965436297754915010" }, { id: "1965409966187295092" }, {id: "1971565797287108970"}, {id: "1966084169655791869"}, { id: "1965426555590717526"}, { id: "1965772970657468677"}, { id: "1967915727815578065" }, { id: "1965407574557368365" }, { id: "1965830077746188438" }, { id: "1965414985338945986"}],
    usTweets: [{ id: "1965571381229224431" }]
  }
]

module.exports = { claim2, examples2 };