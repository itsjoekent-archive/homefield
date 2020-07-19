const { MongoClient } = require('mongodb');

const setupDb = require('../src/setupDb');
const Account = require('../src/models/Account');
const Campaign = require('../src/models/Campaign');

(async function seed() {
  try {
    console.log('Running seed script');

    const { MONGODB_URL } = process.env;

    const client = await MongoClient.connect(MONGODB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    const db = client.db();

    console.log('! Clearing DB !');
    await db.dropDatabase();
    await setupDb(db);

    console.log('Seeding accounts...');

    const adminAccountResult = await Account(db).createAccount(
      'admin@homefield.com',
      'password',
      'Admin',
    );

    if (adminAccountResult instanceof Error) {
      throw adminAccountResult;
    }

    // seed campaigns
    // ...

    console.log('Seed finished!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    console.log('Seed encountered error, exiting...');
    process.exit(1);
  }
})();
