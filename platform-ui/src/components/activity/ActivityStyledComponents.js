import styled, { css } from 'styled-components';

export const ActivityRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  margin-bottom: 24px;
`;

export const ActivityDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Avatar = styled.img`
  display: block;
  width: 64px;
  height: 64px;
  max-width: 64px;
  max-height: 64px;

  object-fit: cover;
  object-position: center;

  border-radius: 50%;
  ${({ isProfile, theme }) => isProfile && css`
    border: 4px solid ${theme.colors.blue.base};
  `}

  margin-right: 16px;

  cursor: pointer;
`;

export const ActivityDescription = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.paragraph};
  color: ${({ theme }) => theme.colors.mono.black};

  margin-bottom: 6px;
`;

export const ActivityDescriptionHighlight = styled.span`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: 800;
  color: ${({ theme }) => theme.colors.blue.base};
`;

export const ActivityTimestamp = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: 14px
  font-weight: 200;
  color: ${({ theme }) => theme.colors.mono.black};
`;
