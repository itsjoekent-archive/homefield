import React from 'react';
import styled, { css } from 'styled-components';
import { Link } from '@reach/router';
import NavMenu from 'components/NavMenu';
import TabbedNavigation from 'components/TabbedNavigation';
import { DASHBOARD_DEFAULT_ROUTE } from 'routes';
import logo from 'assets/logo-name-blue-100.png';

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

const NavContainer = styled.nav`
  background-color: ${({ theme }) => theme.colors.mono[200]};
  border-bottom: 2px solid ${({ theme }) => theme.colors.mono[400]};

  padding-top: 16px;
  padding-bottom: 16px;

  ${({ hasTabbedNavigation }) => hasTabbedNavigation && css`
    padding-bottom: 0;

    ${NavRow}:first-child {
      margin-bottom: 36px;
    }
  `}
`;

const Logo = styled.img`
  width: 200px;
`;

export default function AppNav(props) {
  const { tabs } = props;

  return (
    <NavContainer hasTabbedNavigation={!!tabs}>
      <NavRow>
        <Link to={DASHBOARD_DEFAULT_ROUTE}>
          <Logo src={logo} />
        </Link>
        <NavMenu />
      </NavRow>
      {tabs && (
        <NavRow>
          <TabbedNavigation tabs={tabs} />
        </NavRow>
      )}
    </NavContainer>
  );
}
