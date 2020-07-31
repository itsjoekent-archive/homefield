import React from 'react';
import ago from 's-ago';
import { Link } from '@reach/router';
import {
  ActivityRow,
  ActivityDetails,
  Avatar,
  ActivityDescription,
  ActivityDescriptionHighlight,
  ActivityTimestamp,
} from 'components/activity/ActivityStyledComponents';
import { DASHBOARD_CAMPAIGN_ROUTE } from 'routes';

export default function AccountActivityFeed(props) {
  const { activity } = props;

  return activity.map((item) => (
    <ActivityRow key={item.id}>
      <Link to={DASHBOARD_CAMPAIGN_ROUTE.replace(':slug', item.campaign.slug)}>
        <Avatar src={item.campaign.logoUrl} />
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
            case 'calls':
              return (
                <ActivityDescription>
                  {item.account.firstName} made <ActivityDescriptionHighlight>{item.value}</ActivityDescriptionHighlight> calls for the {item.campaign.name} campaign!
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
