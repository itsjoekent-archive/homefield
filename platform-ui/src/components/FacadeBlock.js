import React from 'react';
import styled from 'styled-components';

export const NARROW_BLOCK = '400px';
export const WIDE_BLOCK = '600px';

export const Block = styled.main`
  display: block;
  width: 100%;
  max-width: ${({ maxWidth }) => maxWidth};

  background-color: ${({ theme }) => theme.colors.mono.white};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadow.strong};
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.componentTitle};
  font-weight: ${({ theme }) => theme.type.weight.componentTitle};
  text-align: center;
  color: ${({ theme }) => theme.colors.blue.darkest};
`;

const TitleBlock = styled.div`
  display: block;
  width: 100%;
  padding: 12px 24px;

  text-align: center;

  border-top-left-radius: ${({ theme }) => theme.borderRadius};
  border-top-right-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.blue.lightest};
`;

const InnerBlock = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
`;

export default function FacadeBlock(props) {
  const {
    children,
    title,
    maxWidth = NARROW_BLOCK,
  } = props;

  return (
    <Block maxWidth={maxWidth}>
      {title && (
        <TitleBlock>
          <Title>{title}</Title>
        </TitleBlock>
      )}
      <InnerBlock>
        {children}
      </InnerBlock>
    </Block>
  );
}
