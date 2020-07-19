import styled, { css } from 'styled-components';

export const TextInputBox = styled.input`
  display: block;
  width: 100%;
  padding: 12px;

  color: ${({ theme }) => theme.colors.black};

  border: 1px solid ${({ theme }) => theme.colors.mono['400']};
  border-radius: ${({ theme }) => theme.borderRadius};

  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.input};
  font-weight: ${({ theme }) => theme.type.weight.input};

  ${({ hasError }) => hasError && css`
    border: 2px solid ${({ theme }) => theme.colors.red.base};
  `}

  &:focus {
    border: 1px solid ${({ theme }) => theme.colors.blue.base};
  }

  &:placeholder {
    color: ${({ theme }) => theme.colors.mono[800]};
  }
`;
