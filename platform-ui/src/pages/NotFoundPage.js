import React from 'react';
import styled from 'styled-components';
import Facade from 'components/Facade';

const Title = styled.h1`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.title};
  font-weight: ${({ theme }) => theme.type.weight.title};;
  color: ${({ theme }) => theme.colors.mono.white};

  text-align: center;

  margin-bottom: 24px;
`;

const Subtitle = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.paragraph};;
  color: ${({ theme }) => theme.colors.mono.white};

  text-align: center;
`;

export default function NotFoundPage() {
  return (
    <Facade>
      <Title>Page not found</Title>
      <Subtitle>Looks like you hit one out of the park!</Subtitle>
    </Facade>
  );
}
