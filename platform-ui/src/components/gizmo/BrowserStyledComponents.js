import styled, { css } from 'styled-components';

export const BrowserList = styled.div`
  display: flex;
  flex-direction: column;

  padding-left: 12px;
  padding-right: 12px;

  background-color: ${({ theme }) => theme.colors.mono[300]};
  border-top: 2px solid ${({ theme }) => theme.colors.blue.darkest};

  height: 100%;
  overflow-y: scroll;
`;

export const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  margin-top: 12px;
  margin-bottom: 24px;
`;

export const Title = styled.h2`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.header};
  color: ${({ theme }) => theme.colors.purple.darkest};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const CloseButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;

  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.button};
  font-weight: ${({ theme }) => theme.type.weight.button};
  text-transform: uppercase;
  text-align: center;
  text-decoration: none;
  letter-spacing: 1px;

  color: ${({ theme }) => theme.colors.mono[800]};
  background: none;
  border: 2px solid transparent;
  border-radius: ${({ theme }) => theme.borderRadius};

  cursor: pointer;

  padding: 8px 16px;
  padding-right: 28px;
  margin: 0;

  position: relative;

  &:before, &:after {
    content: '';
    display: block;
    position: absolute;

    width: 2px;
    height: 12px;
    right: 12px;

    top: 16px;

    background-color: ${({ theme }) => theme.colors.mono[800]};
    transform: rotate(45deg);
  }

  &:after {
    transform: rotate(-45deg);
  }

  &:hover {
    color: ${({ theme }) => theme.colors.mono.black};
    border: 2px solid ${({ theme }) => theme.colors.mono.black};

    &:before, &:after {
      background-color: ${({ theme }) => theme.colors.mono.black};
    }
  }
`;

export const BrowserCardTitle = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.header};
  color: ${({ theme }) => theme.colors.mono[1100]};

  margin-bottom: 12px;

  text-align: left;
`;

export const BrowserCardDescription = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: 16px;
  font-weight: ${({ theme }) => theme.type.weight.paragraph};
  color: ${({ theme }) => theme.colors.mono[1100]};

  text-align: left;
`;

export const BrowserCard = styled.button`
  display: block;
  margin-bottom: 24px;
  padding: 0;

  background-color: ${({ theme }) => theme.colors.mono.white};
  box-shadow: ${({ theme }) => theme.shadow.light};

  border-radius: ${({ theme }) => theme.borderRadius};
  border: none;

  cursor: pointer;

  &:hover {
    box-shadow: none;
  }

  ${({ highlight }) => highlight && css`
    cursor: default;
    box-shadow: none;
    background-color: ${({ theme }) => theme.colors.purple.base};

    ${BrowserCardTitle}, ${BrowserCardDescription} {
      color: ${({ theme }) => theme.colors.mono.white};
    }
  `}
`;

export const BrowserCardStatus = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  background-color: ${({ theme }) => theme.colors.purple.base};

  border-bottom-left-radius: ${({ theme }) => theme.borderRadius};
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius};

  padding: 8px;
`;

export const BrowserCardStatusLabel = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: 14px;
  font-weight: ${({ theme }) => theme.type.weight.label};
  color: ${({ theme }) => theme.colors.mono.white};
`;
