# Defender of Israel

This project contains a repository of Tweets that demonstrate the base tactics of our enemies. Having specific examples to counter their claims is the purpose of this app.

## How to use

← `server.js`: Has the connection to Mongoose. You may have to manually switch between process.env.MONGO_LOCAL and process.env.MONGO_REMOTE.

← `server_testAPI.js`: Has endpoints for adding data to the project, including new Keywords, Claims and Examples. If any new Keywords or Claims are added, they will be written in the claims.json and keywords.json files, and then must be manually added to the front end (in the `constants.js` file).

← `server_testAPI.js`: The endpoint for user submissions is in this file. New submissions will be saved in your database under ExampleSubmissions and emailed to your `sc*******48@gmail.com` address. These will then need to be manually added to the Examples database once approved to the `/add_example` endpoint (in `server_testAPI.js`);
