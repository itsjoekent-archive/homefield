import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Snack from 'components/Snack';
import { useApplicationContext } from 'ApplicationContext';

const Container = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: ${({ theme }) => theme.zIndex.snacks};
  padding: 24px;
`;

export default function SnackList() {
  const { snacks } = useApplicationContext();

  if (!snacks.length) {
    return null;
  }

  return ReactDOM.createPortal(
    (
      <Container>
        {snacks.map((snack) => (
          <Snack key={snack.id} {...snack} />
        ))}
      </Container>
    ),
    document.getElementById('react-snacks'),
  );
}
