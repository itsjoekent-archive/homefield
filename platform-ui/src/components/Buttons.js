import styled, { css, keyframes } from 'styled-components';

const spinnerFrames = keyframes`
  100% {
    transform: rotate(360deg);
  }
`;

const disabledStyles = css`
  cursor: not-allowed;
  color: ${({ theme }) => theme.colors.mono[700]};
  background-color: ${({ theme }) => theme.colors.mono[300]};
`;

export const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  position: relative;

  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.button};
  font-weight: ${({ theme }) => theme.type.weight.button};
  text-transform: uppercase;
  text-align: center;
  text-decoration: none;
  letter-spacing: 1px;

  padding: 8px 24px;
  margin: 0;

  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};

  cursor: pointer;

  &:disabled {
    ${disabledStyles}
  }

  ${({ loading }) => loading === 'true' && css`
    ${disabledStyles}

    transition: width 1s;
    padding-left: 32px;

    &:before {
      content: '';
      display: block;
      position: absolute;
      left: 12px;
      width: 8px;
      height: 8px;
      border-top-left-radius: 50%;
      border-top-right-radius: 50%;
      border-top: 2px solid ${({ theme }) => theme.colors.mono.black};
      animation: 1s ${spinnerFrames} linear infinite;
    }
  `}
`;

export const LightBlueButton = styled(Button)`
  color: ${({ theme }) => theme.colors.blue.darkest};
  background-color: ${({ theme }) => theme.colors.blue.lightest};

  ${({ loading }) => (!loading || loading === 'false') && css`
    &:hover {
      color: ${({ theme }) => theme.colors.mono.white};
      background-color: ${({ theme }) => theme.colors.blue.darkest};
    }
  `}

  ${({ loading }) => loading === 'true' && disabledStyles}
`;

export const BoldTextButton = styled.span`
  margin-top: 8px;
  margin-bottom: 8px;

  a {
    display: block;
    width: fit-content;

    color: ${({ theme }) => theme.colors.mono.white};

    font-family: ${({ theme }) => theme.font};
    font-size: ${({ theme }) => theme.type.size.button};
    font-weight: ${({ theme }) => theme.type.weight.button};
    text-decoration: none;

    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const CancelButton = styled.button`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.button};
  font-weight: ${({ theme }) => theme.type.weight.button};
  text-transform: uppercase;
  text-align: center;
  text-decoration: none;
  letter-spacing: 1px;

  color: ${({ theme }) => theme.colors.red.base};
  background: none;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.borderRadius};

  cursor: pointer;

  padding: 8px 16px;
  margin: 0;

  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.red.base};
  }
`;
