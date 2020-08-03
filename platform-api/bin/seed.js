const { MongoClient } = require('mongodb');

const setupDb = require('../src/setupDb');
const Account = require('../src/models/Account');
const Activity = require('../src/models/Activity');
const Campaign = require('../src/models/Campaign');

const seedWiki = require('./seed-wiki');

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

    console.log('Seeding admin accounts...');

    const adminAccountResult = await Account(db).createAccount(
      'admin@homefield.com',
      'password',
      'Admin',
    );

    if (adminAccountResult instanceof Error) {
      throw adminAccountResult;
    }

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
        'Penny For NY-10',
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
      {
        '$set': {
          isPublic: true,
          wiki: seedWiki,
        },
      },
    )));

    await db.collection('campaigns').findOneAndUpdate(
      { _id: campaigns[0]._id },
      {
        '$set': {
          dialer: {
            iframe: 'http://thrutalk.io/caller/login/iframe/vfh2020nc',
          },
          firewall: [
            campaigns[2]._id,
          ],
        },
      },
    );

    await db.collection('campaigns').findOneAndUpdate(
      { _id: campaigns[2]._id },
      {
        '$set': {
          firewall: [
            campaigns[0]._id,
          ],
        },
      },
    );

    console.log('Seeding volunteer accounts...');

    const suzy = await Account(db).createAccount(
      'suzy@votefromhome2020.org',
      'password',
      'Suzy',
    );

    await Account(db).collection.findOneAndUpdate(
      { _id: suzy._id },
      {
        '$set': {
          username: 'suzy',
          lastName: 'Smith',
          bio: 'Co-Founder of Vote From Home 2020. Proud to have worked for @ewarren, @LetAmericaVote, @JasonKander, @SylvesterTurner & MI Dems. She/Her',
          twitterUsername: 'suzytweet',
          avatarUrl: '/seed/vol-suzy.jpeg',
          campaigns: [campaigns[0]._id],
        },
      }
    );

    await Activity(db).createActivity(
      suzy,
      campaigns[0],
      'joined',
      null,
    );

    const ben = await Account(db).createAccount(
      'ben@votefromhome2020.org',
      'password',
      'Ben',
    );

    await Account(db).collection.findOneAndUpdate(
      { _id: ben._id },
      {
        '$set': {
          username: 'ben',
          lastName: 'Tyson',
          bio: 'Co-Founder @votefromhome20 . Previously organizing for @letamericavote @jasonkander @sylvesterturner @michigandems @clairecmc @michaelbennet ... I help elect Dems',
          twitterUsername: 'bhtyson',
          avatarUrl: '/seed/vol-ben.jpeg',
          campaigns: [campaigns[0]._id],
        },
      },
    );

    await Activity(db).createActivity(
      ben,
      campaigns[0],
      'joined',
      null,
    );

    const keith = await Account(db).createAccount(
      'keith@votefromhome2020.org',
      'password',
      'Keith',
    );

    await Account(db).collection.findOneAndUpdate(
      { _id: keith._id },
      {
        '$set': {
          username: 'keith',
          lastName: 'Presley',
          avatarUrl: '/seed/vol-keith.png',
        },
      },
    );

    console.log('Seeding volunteer activity...');

    await Activity(db).createActivity(
      ben,
      campaigns[0],
      'calls',
      10,
    );

    await Activity(db).createActivity(
      ben,
      campaigns[0],
      'calls',
      20,
    );

    await Activity(db).createActivity(
      ben,
      campaigns[0],
      'calls',
      30,
    );

    await Activity(db).createActivity(
      suzy,
      campaigns[0],
      'texts',
      50,
    );

    await Activity(db).createActivity(
      ben,
      campaigns[0],
      'calls',
      40,
    );

    await Activity(db).createActivity(
      ben,
      campaigns[0],
      'calls',
      50,
    );

    await Activity(db).createActivity(
      suzy,
      campaigns[0],
      'texts',
      100,
    );

    console.log('Seed finished!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    console.log('Seed encountered error, exiting...');
    process.exit(1);
  }
})();
