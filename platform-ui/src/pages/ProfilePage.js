import React from 'react';
import styled from 'styled-components';
import { Link } from '@reach/router';
import ActivityFeed from 'components/activity/ActivityFeed';
import NavMenu from 'components/NavMenu';
import useApiFetch from 'hooks/useApiFetch';
import useAuthorizationGate from 'hooks/useAuthorizationGate';
import usePrevious from 'hooks/usePrevious';
import { DASHBOARD_ROUTE } from 'routes';
import logo from 'assets/logo-name-blue-100.png';

const NavContainer = styled.nav`
  background-color: ${({ theme }) => theme.colors.mono[200]};
  border-bottom: 2px solid ${({ theme }) => theme.colors.mono[400]};

  padding-top: 16px;
  padding-bottom: 16px;
`;

const NavRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  width: 100%;
  max-width: 1240px;

  margin-left: auto;
  margin-right: auto;

  padding-left: 24px;
  padding-right: 24px;
`;

const Logo = styled.img`
  width: 200px;
`;

const Layout = styled.main`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  width: 100%;
  max-width: 1240px;

  margin-left: auto;
  margin-right: auto;
  margin-top: 48px;

  padding-left: 24px;
  padding-right: 24px;
`;

const ActivityColumn = styled.div`
  display: flex;
  flex-direction: column;

  width: calc(66.66% - 24px);
`;

const ActivityHeader = styled.h2`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.header};
  font-weight: ${({ theme }) => theme.type.weight.header};;
  text-align: left;
  color: ${({ theme }) => theme.colors.mono.black};

  margin-bottom: 24px;
`;

export default function ProfilePage(props) {
  const { username } = props;

  useAuthorizationGate(false);

  const apiFetch = useApiFetch();
  const previousUsername = usePrevious(username);

  const [account, setAccount] = React.useState(null);

  React.useEffect(() => {
    if (account && (username !== previousUsername)) {
      setAccount(null);
    }
  }, [
    username,
    previousUsername,
    account,
    setAccount,
  ]);

  React.useEffect(() => {
    let cancel = false;

    async function fetchProfileAccount() {
      try {
        const response = await apiFetch(`/v1/accounts/${username}`);
        const json = await response.json();

        if (cancel) {
          return;
        }

        if (response.status === 200) {
          setAccount(json.data.account);
          return;
        }

        throw new Error(json.error || 'Failed to load profile');
      } catch (error) {
        console.error(error);
        // TODO: Snack error
      }
    }

    if (username && !account) {
      fetchProfileAccount();
    }

    return () => cancel = true;
  }, [
    apiFetch,
    username,
    account,
    setAccount,
  ]);

  return (
    <React.Fragment>
      <NavContainer>
        <NavRow>
          <Link to={DASHBOARD_ROUTE}>
            <Logo src={logo} />
          </Link>
          <NavMenu />
        </NavRow>
      </NavContainer>
      <Layout>
        <ActivityColumn>
          <ActivityHeader>Recent Activity</ActivityHeader>
          <ActivityFeed username={username} />
        </ActivityColumn>
      </Layout>
    </React.Fragment>
  );
}
