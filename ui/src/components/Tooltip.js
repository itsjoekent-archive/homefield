import React from 'react';
import styled, { css } from 'styled-components';

const placementStyles = {
  'top': {
    wrapper: css`
      flex-direction: column;
      align-items: center;
    `,
    label: css`
      top: -40px;
    `,
    arrow: css`
      transform: rotate(180deg);
      top: -6px;
    `,
  },
  'left': {
    wrapper: css`
      flex-direction: row;
      align-items: center;
    `,
    label: css`
      transform: translate(calc(-100% - 8px), 0);
    `,
    arrow: css`
      transform: translate(calc(-100% - 1px), 0) rotate(90deg);
      z-index: -1;
    `,
  },
}

const Wrapper = styled.div`
  display: flex;
  position: relative;
  width: fit-content;
  z-index: 1;

  ${({ placement }) => placementStyles[placement]['wrapper']}

  ${({ showTooltip, label, placement }) => showTooltip && css`
    &:before {
      content: "${label}";
      display: block;

      position: absolute;
      ${placementStyles[placement]['label']}

      width: fit-content;

      font-family: ${({ theme }) => theme.font};
      font-size: ${({ theme }) => theme.type.size.label};
      font-weight: ${({ theme }) => theme.type.weight.label};

      white-space: nowrap;

      color: ${({ theme }) => theme.colors.mono.white};
      background-color: ${({ theme }) => theme.colors.mono.black};

      padding: 8px;
      padding-top: 4px;

      border-radius: ${({ theme }) => theme.borderRadius};
    }

    &:after {
      content: '';
      display: block;

      position: absolute;
      ${placementStyles[placement]['arrow']}

      width: 0;
      height: 0;

      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-bottom: 5px solid ${({ theme }) => theme.colors.mono.black};
    }
  `}
`;

export default function Tooltip(props) {
  const {
    children,
    label,
    placement = 'top',
    wait = 1000,
  } = props;

  const [isHovering, setIsHovering] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);

  React.useEffect(() => {
    if (!isHovering && showTooltip) {
      setShowTooltip(false);
      return;
    }

    if (isHovering && !showTooltip) {
      const timeoutId = setTimeout(() => setShowTooltip(true), wait);
      return () => clearTimeout(timeoutId);
    }
  }, [
    isHovering,
    showTooltip,
    setShowTooltip,
    wait,
  ]);

  return (
    <Wrapper
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      showTooltip={showTooltip}
      label={label}
      placement={placement}
    >
      {children}
    </Wrapper>
  );
}
