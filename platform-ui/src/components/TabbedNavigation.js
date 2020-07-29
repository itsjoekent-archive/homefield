import React from 'react';
import styled from 'styled-components';
import { Link } from '@reach/router';

const NavTabRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const Tab = styled.span`
  a {
    display: block;

    font-family: ${({ theme }) => theme.font};
    font-size: ${({ theme }) => theme.type.size.paragraph};
    font-weight: ${({ theme }) => theme.type.weight.paragraph};
    text-align: left;
    color: ${({ theme }) => theme.colors.mono[800]};
    text-decoration: none;

    cursor: pointer;
    user-select: none;

    padding-bottom: 4px;
    margin-right: 24px;

    border-bottom: 4px solid ${({ theme }) => theme.colors.mono.white};
  }

  &:hover a {
    color: ${({ theme }) => theme.colors.blue.dark};
  }

  a.-active {
    color: ${({ theme }) => theme.colors.blue.base};

    border-bottom: 4px solid ${({ theme }) => theme.colors.blue.base};
  }
`;

export default function TabbedNavigation(props) {
  const { tabs } = props;

  return (
    <NavTabRow>
      {tabs.map((tab) => (
        <Tab key={tab[0]}>
          <Link
            getProps={({ isCurrent }) => isCurrent ? { className: '-active' } : {}}
            to={tab[0]}
          >
            {tab[1]}
          </Link>
        </Tab>
      ))}
    </NavTabRow>
  );
}
