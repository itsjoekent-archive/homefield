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
    console.log('Seeding campaigns...');

    const campaigns = await Promise.all([
      Campaign(db).createCampaign(
        'Governor For Governor',
        'California',
        '/seed/campaign-gov.jpg',
      ),
      Campaign(db).createCampaign(
        'Kangaroo For Senate',
        'Florida',
        '/seed/campaign-kangaroo.jpg',
      ),
      Campaign(db).createCampaign(
        'Mr Puff Pastry For President',
        'Michigan',
        '/seed/campaign-mr-puff-pastry.jpg',
      ),
      Campaign(db).createCampaign(
        'Mr Puff Pastry For President',
        'Pennsylvania',
        '/seed/campaign-mr-puff-pastry.jpg',
      ),
      Campaign(db).createCampaign(
        'Penny For NY-10 ',
        'New York, NY',
        '/seed/campaign-penny.jpg',
      ),
      Campaign(db).createCampaign(
        'Sausages For President',
        'Ohio',
        '/seed/campaign-sausage.jpg',
      ),
      Campaign(db).createCampaign(
        'Sweeper For Manhattan DA',
        'New York, NY',
        '/seed/campaign-sweeper.jpg',
      ),
    ]);

    await Promise.all(campaigns.map((campaign) => db.collection('campaigns').findOneAndUpdate(
      { _id: campaign._id },
      { '$set': { isPublic: true } },
    )));

    console.log('Seed finished!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    console.log('Seed encountered error, exiting...');
    process.exit(1);
  }
})();
