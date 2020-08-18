import styled, { css } from 'styled-components';

export const CampaignLogo = styled.img`
  display: block;
  width: 64px;
  min-width: 64px;
  min-height: 64px;
  max-height: 64px;
  max-width: 64px;
  margin-right: 12px;

  border-top-left-radius: ${({ theme }) => theme.borderRadius};
  border-bottom-left-radius: ${({ theme }) => theme.borderRadius};
`;

export const CampaignDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
`;

export const CampaignTitle = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: 600;
  text-align: left;
  color: ${({ theme }) => theme.colors.blue.darkest};

  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CampaignLocation = styled.span`
  font-family: ${({ theme }) => theme.font};
  font-size: 14px;
  font-weight: 300;
  text-align: left;
  color: ${({ theme }) => theme.colors.mono['700']};
`;

export const CampaignContainer = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;

  width: calc(33.33% - 12px);
  height: 64px;

  border: 1px solid ${({ theme }) => theme.colors.mono['400']};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadow.light};
  background-color: ${({ theme }) => theme.colors.mono.white};

  margin-bottom: 24px;
  padding: 0;
  padding-right: 12px;

  overflow: hidden;

  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.blue.lightest};
  }

  &:focus {
    outline: none;
    border: 1px solid ${({ theme }) => theme.colors.blue.light};
  }

  ${({ isSelected }) => isSelected && css`
    border: 2px solid ${({ theme }) => theme.colors.blue.base};
    outline: none;

    &:focus {
      border: 2px solid ${({ theme }) => theme.colors.blue.base};
    }
  `}
`;
