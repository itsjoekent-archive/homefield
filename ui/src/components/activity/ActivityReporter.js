import React from 'react';
import styled from 'styled-components';
import useApiFetch from 'hooks/useApiFetch';
import { useApplicationContext, pushSnackError } from 'ApplicationContext';
import thumbup from 'assets/thumb-up.png';
import shrug from 'assets/shrug.png';
import thumbdown from 'assets/thumb-down.png';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;

  padding: 24px;

  background-color: ${({ theme }) => theme.colors.mono[300]};
`;

const Header = styled.h2`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.header};
  font-weight: ${({ theme }) => theme.type.weight.header};;
  text-align: center;
  color: ${({ theme }) => theme.colors.blue.dark};

  margin-right: 36px;
`;

const ThanksMessage = styled.p`
  font-family: ${({ theme }) => theme.font};
  font-size: ${({ theme }) => theme.type.size.header};
  font-weight: ${({ theme }) => theme.type.weight.paragraph};
  text-align: left;
  color: ${({ theme }) => theme.colors.blue.darkest};

  height: 48px;
  vertical-align: middle;
`;

const Reaction = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 48px;
  height: 48px;

  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.mono.white};
  overflow: hidden;

  background-color: ${({ theme }) => theme.colors.mono.white};
  box-shadow: ${({ theme }) => theme.shadow.light};

  margin-right: 24px;

  cursor: pointer;

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    border: 2px solid ${({ theme }) => theme.colors.blue.dark};
  }

  img {
    display: block;
    width: 28px;
    height: 28px;
    object-fit: cover;
    object-position: center;
  }
`;

export default function ActivityReporter(props) {
  const {
    campaign,
    prompt,
    verb,
    activityType,
    isPartying,
    setIsPartying,
    thanksMessage = 'Thanks for your feedback!',
    modulus = 10,
  } = props;

  const { dispatch } = useApplicationContext();
  const apiFetch = useApiFetch();

  const [counter, setCounter] = React.useState(0);
  const [lastParty, setLastParty] = React.useState(null);
  const [displayThanks, setDisplayThanks] = React.useState(false);
  const [hasPushedActivity, setHasPushedActivity] = React.useState(false);

  React.useEffect(() => {
    if (displayThanks) {
      const timeoutId = setTimeout(() => {
        setDisplayThanks(false);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [displayThanks, setDisplayThanks]);

  React.useEffect(() => {
    if (
      counter > 0
      && counter % modulus === 0
      && !isPartying
      && lastParty !== counter
    ) {
      setIsPartying(true);
      setLastParty(counter);
      setHasPushedActivity(false);
    }
  }, [
    counter,
    modulus,
    isPartying,
    setIsPartying,
    lastParty,
    setLastParty,
    setHasPushedActivity,
  ]);

  React.useEffect(() => {
    let cancel = false;

    async function pushActivity() {
      try {
        const response = await apiFetch('/v1/activity', {
          method: 'post',
          body: JSON.stringify({
            campaignId: campaign.id,
            type: activityType,
            value: counter,
          }),
        });

        if (cancel) {
          return;
        }

        if (response.status !== 200) {
          const json = await response.json();

          throw new Error(json.error || 'Failed to push activity');
        }
      } catch (error) {
        console.error(error)
        pushSnackError(dispatch, error);
      }
    }

    if (isPartying && !hasPushedActivity) {
      setHasPushedActivity(true);
      pushActivity();
    }

    return () => cancel = true;
  }, [
    apiFetch,
    dispatch,
    campaign,
    activityType,
    counter,
    isPartying,
    hasPushedActivity,
    setHasPushedActivity,
  ]);

  function onClick() {
    setDisplayThanks(true);
    setCounter(counter + 1);
  }

  return (
    <Container>
      {displayThanks && (
        isPartying ? (
          <ThanksMessage>You've completed {counter} {verb}!</ThanksMessage>
        ) : (
          <ThanksMessage>{thanksMessage}</ThanksMessage>
        )
      )}
      {!displayThanks && (
        <React.Fragment>
          <Header>{prompt}</Header>
          <Reaction onClick={onClick} aria-label="I had a positive reaction to this conversation">
            <img src={thumbup} alt="Thumbs up emoji" />
          </Reaction>
          <Reaction onClick={onClick} aria-label="I had no reaction to this conversation">
            <img src={shrug} alt="Shrugging emoji" />
          </Reaction>
          <Reaction onClick={onClick} aria-label="I had a negative reaction to this conversation">
            <img src={thumbdown} alt="Thumbs down emoji" />
          </Reaction>
        </React.Fragment>
      )}
    </Container>
  );
}
