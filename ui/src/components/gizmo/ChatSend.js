import React from 'react';
import styled from 'styled-components';
import { PurpleButton } from 'components/Buttons';
import { TextInputBox } from 'components/forms/TextInputStyled';
import { useGizmoController } from 'components/gizmo/GizmoController';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  padding: 12px;

  background-color: ${({ theme }) => theme.colors.mono[300]};

  ${TextInputBox} {
    font-size: 16px;
    padding: 8px;
    margin-right: 12px;
  }

  ${PurpleButton} {
    height: fit-content;
  }
`;

const InputRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export default function ChatSend() {
  const { chatRoom, socket } = useGizmoController();

  const [message, setMessage] = React.useState('');

  function sendMessage(event) {
    if (event) {
      event.preventDefault();
    }

    if (socket) {
      socket.emit('outgoing-chat-message', message);
    }

    setMessage('');
  }

  function onKeyDown(event) {
    if (event.key === 'Enter') {
      if (!event.shiftKey) {
        sendMessage(event);
      }
    }
  }

  const rows = Math.min((message.match(/\n/g) || []).length + 1, 3);

  return (
    <Container>
      <InputRow>
        <TextInputBox
          as="textarea"
          value={message}
          rows={rows}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`Message #${chatRoom}`}
        />
        <PurpleButton onClick={sendMessage}>Send</PurpleButton>
      </InputRow>
    </Container>
  );
}
