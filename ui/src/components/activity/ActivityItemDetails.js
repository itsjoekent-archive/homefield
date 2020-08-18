import React from 'react';
import ago from 's-ago';
import {
  ActivityDetails,
  ActivityDescription,
  ActivityDescriptionHighlight,
  ActivityTimestamp,
} from 'components/activity/ActivityStyledComponents';

export default function ActivityItemDetails(props) {
  const {
    createdAt,
    type,
    value,
    account,
    campaign,
  } = props;

  return (
    <ActivityDetails>
      {(() => {
        switch (type) {
          case 'joined':
            return (
              <ActivityDescription>
                {account.firstName} joined the {campaign.name} campaign.
              </ActivityDescription>
            );
          case 'calls':
            return (
              <ActivityDescription>
                {account.firstName} completed <ActivityDescriptionHighlight>{value} phonebank calls</ActivityDescriptionHighlight> for the {campaign.name} campaign!
              </ActivityDescription>
            );
          case 'texts':
            return (
              <ActivityDescription>
                {account.firstName} completed <ActivityDescriptionHighlight>{value} SMS conversations</ActivityDescriptionHighlight> for the {campaign.name} campaign!
              </ActivityDescription>
            );
          default:
            return null;
        }
      })()}
      <ActivityTimestamp>
        {ago(new Date(createdAt))}
      </ActivityTimestamp>
    </ActivityDetails>
  );
}
