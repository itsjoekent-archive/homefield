import React from 'react';
import { Link } from '@reach/router';
import ActivityItemDetails from 'components/activity/ActivityItemDetails';
import { ActivityRow, Avatar } from 'components/activity/ActivityStyledComponents';
import { PROFILE_ROUTE } from 'routes';

export default function CampaignActivityFeed(props) {
  const { activity } = props;

  return activity.map((item) => (
    <ActivityRow key={item.id}>
      <Link to={PROFILE_ROUTE.replace(':username', item.account.username)}>
        <Avatar isProfile src={item.account.avatarUrl} />
      </Link>
      <ActivityItemDetails {...item} />
    </ActivityRow>
  ));
}
