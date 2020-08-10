import React from 'react';
import Tooltip from 'components/Tooltip';
import GizmoPushButton from 'components/gizmo/GizmoPushButton';
import { setMicrophoneMuted, useGizmoController } from 'components/gizmo/GizmoController';
import { ReactComponent as DarkMicrophoneIcon } from 'assets/microphone-icon-navy.svg';
import { ReactComponent as LightMicrophoneIcon } from 'assets/microphone-icon-white.svg';

export default function ToggleMicrophoneButton() {
  const { dispatch, isMicrophoneMuted, isStick } = useGizmoController();

  const label = isMicrophoneMuted ? 'Turn on microphone' : 'Turn off microphone';

  return (
    <Tooltip label={label} placement={isStick ? 'left' : 'top'}>
      <GizmoPushButton
        aria-label={label}
        strike={isMicrophoneMuted}
        darken={isMicrophoneMuted}
        onClick={() => dispatch(setMicrophoneMuted(!isMicrophoneMuted))}
      >
        {isMicrophoneMuted ? <LightMicrophoneIcon /> : <DarkMicrophoneIcon />}
      </GizmoPushButton>
    </Tooltip>
  );
}
