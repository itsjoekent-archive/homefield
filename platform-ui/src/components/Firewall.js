import React from 'react';
import styled from 'styled-components';
import { Link } from '@reach/router';
import { CancelButtonInverted, Button } from 'components/Buttons';
import useClickOutside from 'hooks/useClickOutside';
import umpireWhite from 'assets/umpire-white.png';
import { EDIT_ACCOUNT_CAMPAIGNS_ROUTE } from 'routes';

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  width: 100%;
  max-width: 900px;

  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.red.base};
`;

const Header = styled.h1`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.title};
  font-weight: ${({ theme }) => theme.type.weight.title};;
  text-align: left;
  color: ${({ theme }) => theme.colors.mono.white};
  line-height: 1.3;

  width: 100%;

  margin-bottom: 32px;
`;

const Paragraph = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.paragraph};;
  text-align: left;
  color: ${({ theme }) => theme.colors.mono.white};

  margin-bottom: 24px;
`;

const DecorationContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  width: 25%;

  padding-left: 12px;
  padding-right: 12px;
`;

const Decoration = styled.img`
  max-width: 100%;
  object-fit: cover;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;

  width: 75%;

  padding: 24px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;

  ${CancelButtonInverted} {
    margin-right: 24px;
  }
`;

const EditButton = styled(Button)`
  color: ${({ theme }) => theme.colors.red.base};
  background-color: ${({ theme }) => theme.colors.mono.white};

  a {
    color: inherit;
    text-decoration: none;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.mono.white};
    background-color: ${({ theme }) => theme.colors.red.darkest};
  }
`;

export default function Firewall(props) {
  const { errorMessage, onClose } = props;

  const containerRef = useClickOutside(onClose);

  return (
    <Backdrop>
      <Container ref={containerRef}>
        <DecorationContainer>
          <Decoration src={umpireWhite} alt="Baseball umpire making a strikeout pose" />
        </DecorationContainer>
        <Content>
          <Header>Due to FEC Regulations, we can’t let you volunteer for this campaign.</Header>
          <Paragraph>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</Paragraph>
          <Paragraph>{errorMessage}</Paragraph>
          <ButtonRow>
            <CancelButtonInverted onClick={onClose}>Cancel</CancelButtonInverted>
            <EditButton>
              <Link to={EDIT_ACCOUNT_CAMPAIGNS_ROUTE}>Edit Your Campaigns</Link>
            </EditButton>
          </ButtonRow>
        </Content>
      </Container>
    </Backdrop>
  );
}
