import React from 'react';
import styled, { css } from 'styled-components';
import { useApplicationContext } from 'ApplicationContext';

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
    transform: rotate(180deg);
  }
`;

const Avatar = styled.div`
  display: block;

  width: 48px;
  height: 48px;

  overflow: hidden;

  margin-right: 18px;

  img {
    width: 100%;
    height: 100%;
  }
`;

const Name = styled.span`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.paragraph};
  text-align: left;
  color: ${({ theme }) => theme.colors.blue.darkest};
`;

export default function NavMenu() {
  const { authentication: { account } } = useApplicationContext();

  const avatarUrl = (account && account.avatarUrl) || '';

  const name = account ? `${account.firstName}${account.lastName ? ` ${account.lastName}` : ''}` : '';

  return (
    <Container>
      <Avatar>
        <img src={avatarUrl} />
      </Avatar>
      <Name>
        {name}
      </Name>
    </Container>
  );
}
