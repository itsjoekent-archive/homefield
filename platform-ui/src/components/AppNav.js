import React from 'react';
import styled from 'styled-components';
import { Link } from '@reach/router';
import NavMenu from 'components/NavMenu';
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

export default function AppNav() {
  return (
    <NavContainer>
      <NavRow>
        <Link to={DASHBOARD_ROUTE}>
          <Logo src={logo} />
        </Link>
        <NavMenu />
      </NavRow>
    </NavContainer>
  );
}
