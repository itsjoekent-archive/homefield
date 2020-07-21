import React from 'react';
import styled from 'styled-components';
import logo from '../assets/logo-name-white-100.png';
import invertedLogo from '../assets/logo-name-black-100.png';

export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;

  width: 100vw;
  height: 100vh;
  padding: 24px;

  background: linear-gradient(
    to bottom right,
    ${({ theme }) => theme.colors.blue.base},
    ${({ theme }) => theme.colors.purple.base}
  );
`;

const Logo = styled.img`
  position: absolute;
  top: 20px;
  left: 20px;
  width: 192px;
  height: 50px;

  &:hover {
    content: url(${invertedLogo});
  }
`;

export default function Facade(props) {
  const { children } = props;

  return (
    <Layout>
      <a href="/">
        <Logo alt="Homefield logo" src={logo} />
      </a>
      {children}
    </Layout>
  );
}
