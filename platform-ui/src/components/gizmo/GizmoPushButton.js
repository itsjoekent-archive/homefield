import React from 'react';
import styled, { css } from 'styled-components';

const GizmoPushButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 32px;
  height: 32px;
  position: relative;

  border-radius: 50%;
  border: none;
  outline: none;

  box-shadow: ${({ theme }) => theme.shadow.strong};
  background-color: ${({ theme }) => theme.colors.mono.white};

  cursor: pointer;

  ${({ darken }) => darken && css`
    background-color: ${({ theme }) => theme.colors.mono[1100]};
  `}

  ${({ strike }) => strike && css`
    &:before {
      content: '';
      display: block;

      position: absolute;

      width: 75%;
      height: 4px;

      transform: rotate(45deg);

      background-color: ${({ theme }) => theme.colors.red.base};

      border-radius: ${({ theme }) => theme.borderRadius};
    }
  `}

  &:hover {
    box-shadow: ${({ theme }) => theme.shadow.light};
  }
`;

export default GizmoPushButton;
