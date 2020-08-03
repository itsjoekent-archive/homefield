import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { CancelButton, LightBlueButton } from 'components/Buttons';
import useClickOutside from 'hooks/useClickOutside';

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
  flex-direction: column;

  width: 100%;
  max-width: 400px;

  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.mono.white};

  overflow: hidden;
`;

const CopyArea = styled.div`
  padding: 24px;
  padding-bottom: 0;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;

  padding: 12px 24px;
  background-color: ${({ theme }) => theme.colors.mono[300]};

  ${CancelButton} {
    margin-right: 12px;
  }
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.header};
  font-weight: ${({ theme }) => theme.type.weight.header};;
  text-align: left;
  color: ${({ theme }) => theme.colors.blue.darkest};
  line-height: 1.2;

  margin-bottom: 24px;
`;

const Info = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.paragraph};
  font-weight: ${({ theme }) => theme.type.weight.paragraph};;
  text-align: left;
  color: ${({ theme }) => theme.colors.blue.darkest};

  margin-bottom: 24px;
`;

export default function Prompt(props) {
  const {
    title,
    info,
    cancelLabel = 'Cancel',
    confirmLabel = 'Confirm',
    onClose = () => {},
    onConfirmation = () => {},
    isLoading = false,
    children,
  } = props;

  const containerRef = useClickOutside(onClose);

  return ReactDOM.createPortal(
    (
      <Backdrop>
        <Container ref={containerRef}>
          {children ? children : (
            <React.Fragment>
              <CopyArea>
                {title && <Title>{title}</Title>}
                {info && <Info>{info}</Info>}
              </CopyArea>
              <ButtonRow>
                <CancelButton onClick={onClose}>
                  {cancelLabel}
                </CancelButton>
                <LightBlueButton onClick={onConfirmation} loading={`${isLoading}`}>
                  {confirmLabel}
                </LightBlueButton>
              </ButtonRow>
            </React.Fragment>
          )}
        </Container>
      </Backdrop>
    ),
    document.getElementById('react-modal'),
  );
}
