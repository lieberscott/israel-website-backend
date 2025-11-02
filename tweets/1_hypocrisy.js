const claim1 = {
  dateAdded: "",
  claimText: "Israel is the victim of impossible and hypocritical double standards by its so-called 'critics'",
  claimShortText: "Hypocrisy",
  claimId: "000000001",
  incidentIds: [{ incidentId: "00000000X" }]
}

const examples1 = [
  {
    dateAdded: "",
    date: "2025-01-01",
    claimId: "00000001",
    incidentId: "00000000X",
    exampleId: "00000000A",
    keywordIds: ["EmmanuelMacron"],
    text: "When Israel targeted Hamas leaders in Qatar with a missile, France's President Emannuel Macron condemned it, calling it 'unacceptable,' even though France has struck terrorists in foreign countries numerous times under his own leadership!",
    themTweets: [{id: "1965452213792506048"}],
    usTweets: [{ id: "1965477345634255182" }, { id: "1965467866033209695" }]
  },
  {
    dateAdded: "",
    date: "2025-01-02",
    claimId: "00000001",
    incidentId: "00000000X",
    exampleId: "00000000B",
    keywordIds: ["BernieSanders"],
    text: "When America killed Osama bin Laden in Pakistan, Sen. Bernie Sanders applauded the act, praising President Obama and calling it 'a historic moment in our fight against international terrorism.' But when Israel fired missiles in Qatar targeting Hamas leaders, who organized, perpetrated, and celebrated the horrific Oct. 7 attack on Israel, he called it 'a blatent violation of international law' and a justification to end military aid to Israel!",
    themTweets: [{ id: "65074924829687808" }, { id: "1965519234592899316" }],
    usTweets: [{ id: "1965554587462717883" }, { id: "1965557161452601453" }, { id: "1965557610939326889"}]
  },
  {
    dateAdded: "",
    date: "2025-01-03",
    claimId: "00000001",
    incidentId: "00000000X",
    exampleId: "00000000C",
    keywordIds: ["UnitedNations", "AntonioGuterres"],
    text: "When America killed Osama bin Laden in Pakistan, United Nations Secretary General Antonio Guterres applauded the act, calling it 'a watershed moment in our common global fight against terrorism.' But when Israel fired missiles in Qatar targeting Hamas leaders, who organized, perpetrated, and celebrated the horrific Oct. 7 attack on Israel, he 'strongly condemned' the act and called it 'a clear violation of (Qatar's) sovereignty & territorial integrity.'",
    themTweets: [{ id: "1965464597042692415" }],
    usTweets: [{ id: "1965481295431290985" }]
  },
  {
    dateAdded: "",
    date: "2025-10-01",
    claimId: "000000001",
    incidentId: "100000000",
    exampleId: "00000000H",
    keywordIds: ["Qatar"],
    text: "So-called 'critics' of Israel launched an online movement to declare 'I'm not fuckin' dying for Israel' when Israel threatened and eventually launched its attack destroying Iran's nuclear weapons and eliminating its senior officers,' implying WW3 was coming and Israel runs American foreign policy. But when America signed a security commitment with Qatar three months later, promising 'the United States will take all legal and appropriate measures - including diplomatic, economic, and if necessary, military,' against anyone who attacks Qatar, these same voices never said 'I'm not fuckin' dying for Qatar.' And this security arrangemnet with Qatar, the U.S. doesn't even have with Israel.",
    themTweets: [{id: "1932962036880658700"}, {id: "1914149634454528450"}, {id: "1935426333951369287"}, { id: "1932931159706776060" }],
    usTweets: [{ id: "1973365569463394676"}, { id: "1973352469016060000"}]
  }
]

module.exports = { claim1, examples1 };