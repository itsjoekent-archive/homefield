import styled, { css } from 'styled-components';

export const Label = styled.label`
  display: block;

  ${({ hasSubLabel }) => !hasSubLabel && css`
    margin-bottom: 4px;
  `}

  color: ${({ theme }) => theme.colors.mono.black};

  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.label};
  font-weight: ${({ theme }) => theme.type.weight.label};
`;

export const HelpMessage = styled.p`
  display: block;
  margin-bottom: 4px;

  color: ${({ theme }) => theme.colors.mono[800]};

  font-family: ${({ theme }) => theme.font};
  font-size: 14px;
  font-weight: 200;
`;

export const ValidationErrorMessage = styled.p`
  display: block;
  margin-top: 4px;
  margin-bottom: 0px;

  color: ${({ theme }) => theme.colors.red.base};

  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.label};
  font-weight: 600;
`;

export const FormFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;
