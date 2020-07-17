const Campaign = require('../models/Campaign');
const loadUser = require('../middleware/loadUser');
const transformCampaign = require('../transformers/transformCampaign');
const { SUPER_ADMIN_ROLE } = require('../utils/userRoles');

const PAGE_SIZE = 50;

module.exports = () => {
  async function handler(req, res) {
    const { db, query, user } = req;

    let skip = 0;
    let sort = Campaign(db).SORT_CAMPAIGNS_ALPHABETICAL;
    let nameSearch = null;
    let isPublic = true;

    if (query.page) {
      if (isNaN(parseInt(query.page, 10))) {
        res.status(400).json({ error: 'Invalid page parameter '});
        return;
      }

      skip = (parseInt(query.page, 10) * PAGE_SIZE) - PAGE_SIZE;
    }

    if (query.sort) {
      if (query.sort === '-name') {
        sort = Campaign(db).SORT_CAMPAIGNS_REVERSE_ALPHABETICAL;
      }

      if (query.sort === 'created') {
        sort = Campaign(db).SORT_CAMPAIGNS_NEWEST;
      }

      if (query.sort === '-created') {
        sort = Campaign(db).SORT_CAMPAIGNS_OLDEST;
      }
    }

    if (
      !isNaN(parseInt(query.public, 10))
      && user
      && user.role === SUPER_ADMIN_ROLE
    ) {
      isPublic = Boolean(parseInt(query.public));
    }

    const result = await Campaign(db).getPaginatedCampaigns(
      sort,
      skip,
      PAGE_SIZE,
      isPublic,
    );

    if (result instanceof Error) {
      throw result;
    }

    const { data, total } = result;

    res.json({
      meta: {
        total,
        limit: PAGE_SIZE,
        page: (skip / PAGE_SIZE) + 1,
        count: data.length,
      },
      data: data.map((campaign) => transformCampaign(campaign, user)),
    });
  }

  return ['get', '/campaigns', handler, [loadUser]];
};
