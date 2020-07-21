import React from 'react';
import styled from 'styled-components';
import { useApplicationContext } from 'ApplicationContext';

export default function CampaignSelector() {
  const { activeCampaign, dispatch } = useApplicationContext();

  if (activeCampaign) {
    return <h1>{activeCampaign.name}</h1>
  }

  return null;
}
