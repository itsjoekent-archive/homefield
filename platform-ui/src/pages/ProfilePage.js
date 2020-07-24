import React from 'react';
import styled from 'styled-components';
import { Link } from '@reach/router';
import NotFoundPage from 'pages/NotFoundPage';
import ActivityFeed from 'components/activity/ActivityFeed';
import NavMenu from 'components/NavMenu';
import { LightBlueButton } from 'components/Buttons';
import useApiFetch from 'hooks/useApiFetch';
import useAuthorizationGate from 'hooks/useAuthorizationGate';
import usePrevious from 'hooks/usePrevious';
import { useApplicationContext } from 'ApplicationContext';
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

const BioColumn = styled.div`
  display: flex;
  flex-direction: column;

  width: calc(33.33% - 24px);

  a {
    ${LightBlueButton} {
      text-decoration: none;
    }
  }
`;

const Avatar = styled.img`
  display: block;
  width: 100%;
  max-width: 256px;

  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.colors.blue.base};

  margin-left: auto;
  margin-right: auto;
  margin-bottom: 32px;
`;

const BioName = styled.h1`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.title};
  font-weight: ${({ theme }) => theme.type.weight.title};;
  color: ${({ theme }) => theme.colors.mono.black};

  text-align: center;

  margin-bottom: 16px;
`;

const BioDescription = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.paragraph};;
  color: ${({ theme }) => theme.colors.mono.black};

  margin-bottom: 16px;
`;

const BioTwitterRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  margin-bottom: 16px;

  img {
    width: 22px;
    height: 22px;
    margin-right: 8px;
  }
`;

const BioTwitterLink = styled.a`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.purple.base};
  text-decoration: none;

  cursor: pointer;

  padding-bottom: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.purple.dark};
    text-decoration: underline;
  }
`;

const BioCampaignContainer = styled.div`
  display: flex;
  flex-direction: column;

  margin-top: 24px;
  margin-bottom: 24px;
`;

const BioCampaignRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const BioCampaignHeader = styled.h2`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.header};;
  color: ${({ theme }) => theme.colors.mono.black};

  margin-bottom: 16px;
`;

const BioCampaignLogo = styled.img`
  display: block;
  width: 36px;
  height: 36px;
  margin-right: 16px;
  margin-bottom: 16px;
`;

export default function ProfilePage(props) {
  const { username } = props;

  useAuthorizationGate(false);

  const { authentication: { account: authenticatedAccount } } = useApplicationContext();

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

        if (response.status === 404) {
          setAccount('404');
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

  if (account === '404') {
    return (
      <NotFoundPage />
    );
  }

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
        <BioColumn>
          {!!account && (
            <React.Fragment>
              <Avatar src={account.avatarUrl} />
              <BioName>
                {account.firstName} {account.lastName}
              </BioName>
              {account.bio && (
                <BioDescription>
                  {account.bio}
                </BioDescription>
              )}
              {account.twitterUsername && (
                <BioTwitterRow>
                  <img src="/twitter.png" />
                  <BioTwitterLink href={`https://twitter.com/${account.twitterUsername}`} target="_blank" rel="noopener noreferrer">
                    {account.twitterUsername}
                  </BioTwitterLink>
                </BioTwitterRow>
              )}
              {!!account.campaigns && !!account.campaigns.length && (
                <BioCampaignContainer>
                  <BioCampaignHeader>Campaigns</BioCampaignHeader>
                  <BioCampaignRow>
                    {account.campaigns.map((campaign) => (
                      <React.Fragment key={campaign.id}>
                        {/* TODO: Links to the campaign */}
                        <BioCampaignLogo src={campaign.logoUrl} />
                      </React.Fragment>
                    ))}
                  </BioCampaignRow>
                </BioCampaignContainer>
              )}
              {authenticatedAccount && authenticatedAccount.id === account.id && (
                <Link to="/profile/edit">
                  {/* TODO: Profile edit page */}
                  <LightBlueButton>Edit Profile</LightBlueButton>
                </Link>
              )}
            </React.Fragment>
          )}
        </BioColumn>
        <ActivityColumn>
          <ActivityHeader>Recent Activity</ActivityHeader>
          <ActivityFeed username={username} />
        </ActivityColumn>
      </Layout>
    </React.Fragment>
  );
}
