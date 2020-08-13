import React from 'react';
import styled, { css } from 'styled-components';
import Tooltip from 'components/Tooltip';
import {
  useGizmoController,
  setChatRoomParticipants,
  setViewingChatRooms,
  setViewingDirectMessages,
} from 'components/gizmo/GizmoController';
import { ReactComponent as ChannelIcon } from 'assets/channel-browser-icon.svg';
import { ReactComponent as DirectMessageIcon } from 'assets/direct-message-browser-icon.svg';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  padding: 8px;

  background-color: ${({ theme }) => theme.colors.mono[300]};
  border-top: 2px solid ${({ theme }) => theme.colors.blue.darkest};
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

const NavButtonLabel = styled.span`
  font-family: ${({ theme }) => theme.font};
  font-size: 14px;
  font-weight: ${({ theme }) => theme.type.weight.button};
  text-transform: uppercase;
  text-align: right;
  color: ${({ theme }) => theme.colors.purple.darkest};

  flex-grow: 1;
  padding: 0;
  margin-right: 6px;
`;

const NavButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;

  width: 100%;
  margin-bottom: 6px;

  border: none;
  outline: none;
  background: none;

  cursor: pointer;

  &:hover, &:focus {
    ${NavButtonLabel} {
      color: ${({ theme }) => theme.colors.purple.base};
    }

    svg * {
      stroke: ${({ theme }) => theme.colors.purple.base};
    }
  }
`;

const ChannelLabel = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: 16px;
  font-weight: ${({ theme }) => theme.type.weight.button};
  color: ${({ theme }) => theme.colors.purple.base};

  margin-bottom: 6px;
`;

const OnlineRow = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;

  cursor: pointer;

  border: none;
  background: none;
  padding: 0;
`;

const OnlineCountLabel = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.type.weight.button};
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.mono[800]};

  padding-bottom: 3px;
  margin-left: 8px;
`;

const OnlineAvatar = styled.img`
  display: block;
  width: 18px;
  height: 18px;
  max-width: 18px;
  max-height: 18px;

  object-fit: cover;
  object-position: center;

  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.purple.base};

  margin-left: -6px;

  &:first-child {
    margin-left: 0;
  }
`;

export default function ChatNavBar() {
  const {
    chatRoom,
    chatRoomParticipants,
    dispatch,
  } = useGizmoController();

  const volunteerLabel = `volunteer${chatRoomParticipants.length > 1 ? 's' : ''}`;
  const countLabel = `${chatRoomParticipants.length} ${volunteerLabel} online`;

  return (
    <Container>
      <Column>
        <ChannelLabel>#{chatRoom}</ChannelLabel>
        <Tooltip placement="top" label="View all volunteers">
          <OnlineRow>
            {chatRoomParticipants.slice(0, 6).map((participant) => (
              <OnlineAvatar key={participant.id} src={participant.avatarUrl} />
            ))}
            <OnlineCountLabel>{countLabel}</OnlineCountLabel>
          </OnlineRow>
        </Tooltip>
      </Column>
      <Column>
        <NavButton onClick={() => dispatch(setViewingChatRooms(true))}>
          <NavButtonLabel>Chat Channels</NavButtonLabel>
          <ChannelIcon />
        </NavButton>
        <NavButton onClick={() => dispatch(setViewingDirectMessages(true))}>
          <NavButtonLabel>Direct Messages</NavButtonLabel>
          <DirectMessageIcon />
        </NavButton>
      </Column>
    </Container>
  );
}
