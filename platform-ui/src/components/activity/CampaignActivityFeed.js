import React from 'react';
import ago from 's-ago';
import { Link } from '@reach/router';
import {
  ActivityRow,
  ActivityDetails,
  Avatar,
  ActivityDescription,
  ActivityTimestamp,
} from 'components/activity/ActivityStyledComponents';
import { PROFILE_ROUTE } from 'routes';

export default function CampaignActivityFeed(props) {
  const { activity } = props;

  return activity.map((item) => (
    <ActivityRow key={item.id}>
      <Link to={PROFILE_ROUTE.replace(':username', item.account.username)}>
        <Avatar src={item.account.avatarUrl} />
      </Link>
      <ActivityDetails>
        {(() => {
          switch (item.type) {
            case 'joined':
              return (
                <ActivityDescription>
                  {item.account.firstName} joined the {item.campaign.name} campaign.
                </ActivityDescription>
              );
            default:
              return null;
          }
        })()}
        <ActivityTimestamp>
          {ago(new Date(item.createdAt))}
        </ActivityTimestamp>
      </ActivityDetails>
    </ActivityRow>
  ));
}
