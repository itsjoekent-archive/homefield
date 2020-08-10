import React from 'react';
import styled from 'styled-components';
import { useGizmoController } from 'components/gizmo/GizmoController';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  padding: 8px;

  background-color: ${({ theme }) => theme.colors.mono[300]};
  border-top: 2px solid ${({ theme }) => theme.colors.blue.darkest};
`;

const ButtonsRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const NavButton = styled.button`
  font-family: ${({ theme }) => theme.font};
  font-size: 14px;
  font-weight: ${({ theme }) => theme.type.weight.button};
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.mono[800]};

  padding: 0;
  margin-right: 16px;

  border: none;
  outline: none;
  background: none;

  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.mono.black};
  }

  &:focus {
    color: ${({ theme }) => theme.colors.purple.base};
  }

  &:last-child {
    margin-right: 0;
  }
`;

const ChannelLabel = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: 14px;
  font-weight: ${({ theme }) => theme.type.weight.button};
  color: ${({ theme }) => theme.colors.purple.base};
  margin-right: 16px;
`;

export default function ChatNavBar() {
  const { chatRoom } = useGizmoController();

  return (
    <Container>
      <ChannelLabel>#{chatRoom}</ChannelLabel>
      <ButtonsRow>
        <NavButton>Chat Channels</NavButton>
        <NavButton>Direct Messages</NavButton>
      </ButtonsRow>
    </Container>
  );
}
