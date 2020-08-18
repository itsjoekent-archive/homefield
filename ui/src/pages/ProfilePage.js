import React from 'react';
import styled, { css } from 'styled-components';
import { Link, useNavigate } from '@reach/router';
import NotFoundPage from 'pages/NotFoundPage';
import AppNav from 'components/AppNav';
import ActivityFeed from 'components/activity/ActivityFeed';
import { CancelButton, LightBlueButton, MutedButton } from 'components/Buttons';
import FormController from 'components/forms/FormController';
import TextInput from 'components/forms/TextInput';
import SubmitButton from 'components/forms/SubmitButton';
import FormErrorMessage from 'components/forms/FormErrorMessage';
import requiredTextValidator from 'components/forms/requiredTextValidator';
import useApiFetch from 'hooks/useApiFetch';
import useAuthorizationGate from 'hooks/useAuthorizationGate';
import usePrevious from 'hooks/usePrevious';
import { useApplicationContext, pushSnackError } from 'ApplicationContext';
import { PROFILE_ROUTE, DASHBOARD_CAMPAIGN_ROUTE } from 'routes';

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
`;

const Avatar = styled.img`
  display: block;
  width: 100%;
  max-width: 256px;
  max-height: 256px;

  object-fit: cover;
  object-position: center;

  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.colors.blue.base};

  margin-left: auto;
  margin-right: auto;
  margin-bottom: 32px;
`;

const BioName = styled.h1`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.title};
  font-weight: ${({ theme }) => theme.type.weight.title};
  color: ${({ theme }) => theme.colors.mono.black};

  text-align: center;

  margin-bottom: 4px;
`;

const BioCreatedAt = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.label};
  font-weight: 200;
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

const BioEditProfileWrapper = styled.span`
  a {
    text-decoration: none;
  }
`;

const BioEditButtonRow = styled.div`
  display: flex;
  flex-direction: row;

  ${LightBlueButton} {
    margin-right: 16px;
  }
`;

const BioUploadAvatarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  border-radius: 50%;
  overflow: hidden;

  ${MutedButton} {
    display: none;
    position: absolute;
  }

  input {
    display: none;
  }

  &:hover {
    ${MutedButton} {
      display: flex;
    }
  }

  ${({ hasSubmittedAvatar }) => hasSubmittedAvatar && css`
    ${MutedButton} {
      display: flex;
    }
  `}
`;

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function ProfilePage(props) {
  const { username } = props;

  useAuthorizationGate(false);

  const {
    authentication: {
      account: authenticatedAccount,
      token,
    },
    dispatch,
  } = useApplicationContext();

  const apiFetch = useApiFetch();
  const previousUsername = usePrevious(username);
  const navigate = useNavigate();

  const [account, setAccount] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);

  const [hasSubmittedAvatar, setHasSubmittedAvatar] = React.useState(null);
  const avatarInputRef = React.useRef(null);

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

    if (apiFetch.hasTrippedCircuit('get profile')) {
      return;
    }

    async function fetchProfileAccount() {
      try {
        const response = await apiFetch(`/v1/accounts/username/${username}`);
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
        pushSnackError(dispatch, error);
        apiFetch.setHasTrippedCircuit('get profile');
      }
    }

    if (username && !account) {
      fetchProfileAccount();
    }

    return () => cancel = true;
  }, [
    apiFetch,
    dispatch,
    username,
    account,
    setAccount,
  ]);

  React.useEffect(() => {
    async function uploadAvatar() {
      try {
        const file = avatarInputRef.current.files[0];
        const formData = new FormData();
        formData.append('file', file);

        const avatarResponse = await fetch(`${process.env.REACT_APP_API_URL}/v1/files`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const avatarJson = await avatarResponse.json();

        if (avatarResponse.status !== 200) {
          throw new Error(avatarJson.error || 'Failed to upload avatar');
        }

        const { data: { filename } } = avatarJson;

        const profileResponse = await apiFetch('/v1/accounts/avatar', {
          method: 'put',
          body: JSON.stringify({ filename }),
        });

        const profileJson = await profileResponse.json();

        if (profileResponse.status !== 200) {
          throw new Error(profileJson.error || 'Failed to update avatar');
        }

        setAccount({ ...account, avatarUrl: profileJson.data.account.avatarUrl });
        setHasSubmittedAvatar(false);
      } catch (error) {
        console.error(error);
        pushSnackError(dispatch, error);
        setHasSubmittedAvatar(false);
      }
    }

    if (hasSubmittedAvatar) {
      uploadAvatar();
    }
  }, [
    account,
    apiFetch,
    dispatch,
    hasSubmittedAvatar,
    setHasSubmittedAvatar,
    setAccount,
    token,
  ]);

  async function onEditProfile(state) {
    const {
      values: {
        firstName,
        lastName,
        username,
        twitterUsername,
        bio,
      },
    } = state;

    const hasUsernameChanged = account.username !== username;

    const twitterUsernameFormatted = twitterUsername.replace('@', '');

    const payload = {
      firstName,
      lastName,
      username,
      twitterUsername: twitterUsernameFormatted,
      bio,
    };

    const response = await apiFetch('/v1/accounts', {
      method: 'put',
      body: JSON.stringify(payload),
    });

    const json = await response.json();

    if (response.status === 200) {
      const { data: { account: updatedAccount } } = json;

      dispatch((state) => ({
        ...state,
        authentication: { ...state.authentication, account: updatedAccount },
      }));

      setAccount({ ...account, ...payload });
      setIsEditing(false);

      if (hasUsernameChanged) {
        navigate(PROFILE_ROUTE.replace(':username', username));
      }

      return;
    }

    return {
      formError: json.error || 'Failed to update profile',
    };
  }

  function onAvatarUploadClick() {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  }

  if (account === '404') {
    return (
      <NotFoundPage />
    );
  }

  return (
    <React.Fragment>
      <AppNav />
      <Layout>
        <BioColumn>
          {!!account && (
            <React.Fragment>
              {authenticatedAccount && account.id === authenticatedAccount.id ? (
                <BioUploadAvatarContainer isUploading={hasSubmittedAvatar}>
                  <MutedButton
                    onClick={onAvatarUploadClick}
                    loading={`${hasSubmittedAvatar}`}
                  >
                    Upload
                  </MutedButton>
                  <input
                    aria-disabled
                    type="file"
                    ref={avatarInputRef}
                    onChange={() => setHasSubmittedAvatar(true)}
                  />
                  <Avatar src={account.avatarUrl} />
                </BioUploadAvatarContainer>
              ) : (
                <Avatar src={account.avatarUrl} />
              )}
              <BioName>
                {account.firstName} {account.lastName}
              </BioName>
              <BioCreatedAt>Joined {months[new Date(account.createdAt).getMonth()]} {new Date(account.createdAt).getFullYear()}</BioCreatedAt>
              {isEditing && (
                <FormController formId="edit-profile" asyncOnSubmit={onEditProfile}>
                  <TextInput
                    fieldId="firstName"
                    label="First Name"
                    defaultValue={account.firstName}
                    onValueChange={requiredTextValidator('firstName', 'First name')}
                  />
                  <TextInput
                    fieldId="lastName"
                    label="Last Name"
                    defaultValue={account.lastName}
                  />
                  <TextInput
                    fieldId="username"
                    label="Username"
                    defaultValue={account.username}
                    onValueChange={requiredTextValidator('username', 'Username', 3)}
                  />
                  <TextInput
                    fieldId="twitterUsername"
                    label="Twitter Username"
                    help="eg: @votefromhome2020"
                    defaultValue={account.twitterUsername}
                  />
                  <TextInput
                    fieldId="bio"
                    label="Bio"
                    defaultValue={account.bio}
                    isTextArea
                  />
                  <BioEditButtonRow>
                    <SubmitButton
                      renderButton={(buttonProps) => (
                        <LightBlueButton {...buttonProps}>
                          Save
                        </LightBlueButton>
                      )}
                    />
                    <CancelButton onClick={() => setIsEditing(false)}>
                      Cancel
                    </CancelButton>
                  </BioEditButtonRow>
                  <FormErrorMessage />
                </FormController>
              )}
              {!isEditing && (
                <React.Fragment>
                  {account.bio && (
                    <BioDescription>
                      {account.bio}
                    </BioDescription>
                  )}
                  {account.twitterUsername && (
                    <BioTwitterRow>
                      <img src="/twitter.png" alt="Twitter Logo" />
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
                          <Link to={DASHBOARD_CAMPAIGN_ROUTE.replace(':slug', campaign.slug)} key={campaign.id}>
                            <BioCampaignLogo src={campaign.logoUrl} />
                          </Link>
                        ))}
                      </BioCampaignRow>
                    </BioCampaignContainer>
                  )}
                </React.Fragment>
              )}
              {!isEditing && authenticatedAccount && authenticatedAccount.id === account.id && (
                <BioEditProfileWrapper>
                  <LightBlueButton onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </LightBlueButton>
                </BioEditProfileWrapper>
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
