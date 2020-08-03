import React from 'react';
import { Link } from '@reach/router';
import ActivityItemDetails from 'components/activity/ActivityItemDetails';
import { ActivityRow, Avatar } from 'components/activity/ActivityStyledComponents';
import { DASHBOARD_CAMPAIGN_ROUTE } from 'routes';

export default function AccountActivityFeed(props) {
  const { activity } = props;

  return activity.map((item) => (
    <ActivityRow key={item.id}>
      <Link to={DASHBOARD_CAMPAIGN_ROUTE.replace(':slug', item.campaign.slug)}>
        <Avatar src={item.campaign.logoUrl} />
      </Link>
      <ActivityItemDetails {...item} />
    </ActivityRow>
  ));
}
