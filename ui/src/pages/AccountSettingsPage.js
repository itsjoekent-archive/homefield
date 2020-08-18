import React from 'react';
import styled from 'styled-components';
import { Router } from '@reach/router';
import AppNav from 'components/AppNav';
import AccountSettingsForms from 'components/settings/AccountSettingsForms';
import AccountCampaigns from 'components/settings/AccountCampaigns';
import useAuthorizationGate from 'hooks/useAuthorizationGate';

const ACCOUNT = './';
const CAMPAIGNS = 'campaigns';

const tabs = [
  [ACCOUNT, 'Account Settings'],
  [CAMPAIGNS, 'Campaigns'],
];

const Layout = styled.main`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  width: 100%;
  max-width: ${({ theme }) => theme.maxWidth};

  margin-left: auto;
  margin-right: auto;
  margin-top: 48px;

  padding-left: 24px;
  padding-right: 24px;

  padding-bottom: 48px;

  > div {
    width: 100%;
  }
`;

export default function AccountSettingsPage(props) {
  useAuthorizationGate();

  return (
    <React.Fragment>
      <AppNav tabs={tabs} />
      <Layout>
        <Router>
          <AccountSettingsForms path="/" />
          <AccountCampaigns path={CAMPAIGNS} />
        </Router>
      </Layout>
    </React.Fragment>
  );
}
