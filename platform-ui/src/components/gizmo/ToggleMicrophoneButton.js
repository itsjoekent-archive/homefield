import React from 'react';
import Tooltip from 'components/Tooltip';
import GizmoPushButton from 'components/gizmo/GizmoPushButton';
import { setMute, useGizmoController } from 'components/gizmo/GizmoController';
import { ReactComponent as DarkMicrophoneIcon } from 'assets/microphone-icon-navy.svg';
import { ReactComponent as LightMicrophoneIcon } from 'assets/microphone-icon-white.svg';

export default function ToggleMicrophoneButton() {
  const { dispatch, isMuted, isStick } = useGizmoController();

  const label = isMuted ? 'Unmute microphone' : 'Mute microphone';

  return (
    <Tooltip label={label} placement={isStick ? 'left' : 'top'}>
      <GizmoPushButton
        aria-label={label}
        strike={isMuted}
        darken={isMuted}
        onClick={() => dispatch(setMute(!isMuted))}
      >
        {isMuted ? <LightMicrophoneIcon /> : <DarkMicrophoneIcon />}
      </GizmoPushButton>
    </Tooltip>
  );
}
