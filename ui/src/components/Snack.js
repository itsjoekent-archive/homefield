import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useApplicationContext } from 'ApplicationContext';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const Container = styled.div`
  width: 256px;

  padding: 12px;
  margin-top: 24px;

  background: ${({ theme, type }) => theme.colors[type === 'error' ? 'red' : 'blue'].base};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadow.light};

  overflow: hidden;
  opacity: 0;

  animation: ${fadeIn} 0.5s, ${fadeOut} 0.5s 3.5s;
  animation-fill-mode: forwards;
`;

const Message = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.paragraph};
  text-align: left;

  color: ${({ theme }) => theme.colors.mono.white};
`;

export default function Snack(props) {
  const { id, message, type } = props;

  const { dispatch } = useApplicationContext();

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch((copy) => ({
        ...copy,
        snacks: copy.snacks.filter((compare) => compare.id !== id),
      }));
    }, 4000);

    return () => clearTimeout(timeoutId);
  }, [
    id,
    dispatch,
  ]);

  return (
    <Container type={type}>
      <Message>{message}</Message>
    </Container>
  );
}
