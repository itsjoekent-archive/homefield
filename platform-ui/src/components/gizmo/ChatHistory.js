import React from 'react';
import styled from 'styled-components';
import Markdown from 'markdown-to-jsx';
import ago from 's-ago';
import { useGizmoController } from 'components/gizmo/GizmoController';
import usePrevious from 'hooks/usePrevious';

// @ notifications
// is typing...
// unfurl
// get initial messages
// load more messages when you scroll up / reach "end"
// direct message support

const Container = styled.div`
  display: flex;
  flex-direction: column-reverse;
  flex-grow: 1;

  overflow-y: scroll;

  padding: 12px;
  padding-top: 36px;

  background-color: ${({ theme }) => theme.colors.mono.white};
`;

const ChatMessageRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  margin-bottom: 12px;
`;

const MessageColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const MessageDetails = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  margin-bottom: 2px;
`;

const Avatar = styled.img`
  display: block;
  width: 32px;
  height: 32px;
  max-width: 32px;
  max-height: 32px;

  object-fit: cover;
  object-position: center;

  border-radius: 50%;

  margin-top: 8px;
  margin-right: 12px;
`;

const Name = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: 14px;
  font-weight: ${({ theme }) => theme.type.weight.header};
  color: ${({ theme }) => theme.colors.mono[1000]};

  margin-right: 6px;
`;

const Timestamp = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: 14px;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.mono[1000]};
`;

const Message = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: 16px;
  font-weight: ${({ theme }) => theme.type.weight.paragraph};
  color: ${({ theme }) => theme.colors.mono.black};
`;

export default function ChatHistory(props) {
  const { chatRoom, directMessage, dispatch, socket } = useGizmoController();

  const previousChatRoom = usePrevious(chatRoom);
  const [messages, setMessages] = React.useState([]);

  function reconcileNewMessages(newMessages) {
    return setMessages((existingMessages) => {
      const existingMessageIds = existingMessages.reduce((acc, message) => ({
        ...acc,
        [message.id]: true,
      }), {});

      const uniqueNewMessages = newMessages.filter(({ id }) => !existingMessageIds[id]);
      const allMessages = [...existingMessages, ...uniqueNewMessages];

      return allMessages
        .filter((message) => message.room === chatRoom)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });
  }

  React.useEffect(() => {
    if (!socket) {
      return;
    }

    let cancel = false;

    if (chatRoom && chatRoom !== previousChatRoom) {
      setMessages([]);
      socket.emit('join-chat', chatRoom);
    }
  }, [
    socket,
    chatRoom,
    previousChatRoom,
    setMessages,
  ]);

  React.useEffect(() => {
    function onIncomingMessages(messages) {
      reconcileNewMessages(messages);
    }

    socket.on('incoming-chat-messages', onIncomingMessages);

    return () => socket.removeListener('incoming-chat-messages', onIncomingMessages);
  }, [
    chatRoom,
    socket,
    setMessages,
  ]);

  function formatName(message) {
    return `${message.account.firstName}${message.account.lastName ? ` ${message.account.lastName} ` : ''}`;
  }

  function formatTimestamp(message) {
    const createdAt = new Date(message.createdAt);

    if (Math.abs(Date.now() - createdAt) / 36e5 > 24) {
      return ago(message.createdAt);
    }

    const minutes = createdAt.getMinutes();

    let hours = createdAt.getHours();
    let period = 'am';

    if (hours > 12) {
      hours = hours - 12;
      period = 'pm';
    }

    return `${hours}:${minutes} ${period}`;
  }

  const markdownOptions = {
    forceBlock: true,
    overrides: {
      p: { component: Message },
    },
  };

  return (
    <Container>
      {messages.map((message) => (
        <ChatMessageRow key={message.id}>
          <Avatar src={message.account.avatarUrl} />
          <MessageColumn>
            <MessageDetails>
              <Name>{formatName(message)}</Name>
              <Timestamp>{formatTimestamp(message)}</Timestamp>
            </MessageDetails>
            <Markdown options={markdownOptions}>
              {message.text}
            </Markdown>
          </MessageColumn>
        </ChatMessageRow>
      ))}
    </Container>
  );
}
