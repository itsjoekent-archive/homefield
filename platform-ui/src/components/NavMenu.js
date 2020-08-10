import React from 'react';
import styled, { css } from 'styled-components';
import { Link, useNavigate } from '@reach/router';
import { BlueButton, MutedButtonInverted } from 'components/Buttons';
import { useApplicationContext, pushSnackError } from 'ApplicationContext';
import {
  EDIT_ACCOUNT_SETTINGS_ROUTE,
  EDIT_ACCOUNT_CAMPAIGNS_ROUTE,
  LOGIN_ROUTE,
  SIGNUP_ROUTE,
  PROFILE_ROUTE,
} from 'routes';
import useClickOutside from 'hooks/useClickOutside';
import useApiFetch from 'hooks/useApiFetch';

const Container = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;

  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.mono.white};

  padding: 0px 8px;
  padding-right: 24px;

  cursor: pointer;

  &:hover, &:focus {
    border: 1px solid ${({ theme }) => theme.colors.blue.light};
    outline: none;
  }

  &:after {
    content: '';
    position: absolute;
    right: 6px;
    display: block;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid ${({ theme }) => theme.colors.mono.black};

    ${({ isOpen }) => !isOpen && css`
      transform: rotate(180deg);
    `}
  }
`;

const Avatar = styled.div`
  display: block;

  width: 48px;
  height: 48px;

  border-radius: 50%;

  overflow: hidden;

  margin-right: 18px;

  img {
    width: 100%;
    height: 100%;

    object-fit: cover;
    object-position: center;
  }
`;

const Name = styled.span`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.paragraph};
  text-align: left;
  color: ${({ theme }) => theme.colors.blue.darkest};
`;

const Dropdown = styled.div`
  width: 180px;
  position: absolute;
  top: 72px;
  right: 0;
  z-index: ${({ theme }) => theme.zIndex.dropdown};

  border: 1px solid ${({ theme }) => theme.colors.mono[400]};
  border-radius: ${({ theme }) => theme.borderRadius};

  box-shadow: ${({ theme }) => theme.shadow.light};

  &:before {
    content: '';
    position: absolute;
    display: block;
    top: -5px;
    left: calc(50% - 5px);

    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid ${({ theme }) => theme.colors.mono.white};
  }
`;

const DropdownList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
`;

const DropdownLink = styled.span`
  a {
    font-family: ${({ theme }) => theme.font};
    font-size: ${({ theme }) => theme.type.size.paragraph};
    font-weight: ${({ theme }) => theme.type.weight.paragraph};
    text-align: center;
    color: ${({ danger, theme }) => danger ? theme.colors.red.base : theme.colors.blue.darkest};
    text-decoration: none;

    display: block;

    width: 100%;
    padding: 4px 6px;

    background-color: ${({ theme }) => theme.colors.mono.white};
    cursor: pointer;
  }

  &:hover {
    a {
      color: ${({ theme }) => theme.colors.mono.white};
      background-color: ${({ theme }) => theme.colors.blue.base};
    }
  }
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;

  ${MutedButtonInverted} {
    margin-right: 12px;
  }

  ${MutedButtonInverted}, ${BlueButton} {
    a {
      color: inherit;
      text-decoration: none;
    }
  }
`;

export default function NavMenu() {
  const apiFetch = useApiFetch();
  const navigate = useNavigate();

  const { authentication: { account }, dispatch } = useApplicationContext();
  const [isOpen, setIsOpen] = React.useState(false);

  const containerRef = useClickOutside(() => setIsOpen(false));

  const avatarUrl = (account && account.avatarUrl) || '';

  const name = account ? `${account.firstName}${account.lastName ? ` ${account.lastName}` : ''}` : '';

  function onLogout() {
    apiFetch('/v1/logout', { method: 'POST' })
      .then(async (response) => {
        if (response.status === 202) {
          localStorage.removeItem('token');
          localStorage.removeItem('token-expiration');
          localStorage.removeItem('lastActiveCampaignSlug');

          dispatch((state) => ({
            ...state,
            authentication: {
              account: null,
              token: null,
            },
          }));

          navigate(LOGIN_ROUTE);
          return;
        }

        const json = await response.json();

        throw new Error(json.error || 'Failed to logout');
      })
      .catch((error) => {
        console.error(error);
        pushSnackError(dispatch, error);
      });
  }

  if (!account) {
    return (
      <ButtonRow>
        <MutedButtonInverted>
          <Link to={LOGIN_ROUTE}>Log In</Link>
        </MutedButtonInverted>
        <BlueButton>
          <Link to={SIGNUP_ROUTE}>Sign Up</Link>
        </BlueButton>
      </ButtonRow>
    );
  }

  return (
    <Container ref={containerRef} isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
      <Avatar>
        <img alt="Profile avatar" src={avatarUrl} />
      </Avatar>
      <Name>
        {name}
      </Name>
      {isOpen && (
        <Dropdown onBlur={() => setIsOpen(false)}>
          <DropdownList>
            <DropdownLink>
              <Link to={PROFILE_ROUTE.replace(':username', account.username)}>
                Your Profile
              </Link>
            </DropdownLink>
            <DropdownLink>
              <Link to={EDIT_ACCOUNT_SETTINGS_ROUTE}>
                Account Settings
              </Link>
            </DropdownLink>
            <DropdownLink>
              <Link to={EDIT_ACCOUNT_CAMPAIGNS_ROUTE}>
                Your Campaigns
              </Link>
            </DropdownLink>
            <DropdownLink danger>
              <a type="button" tabIndex="0" onClick={onLogout}>Sign out</a>
            </DropdownLink>
          </DropdownList>
        </Dropdown>
      )}
    </Container>
  );
}
