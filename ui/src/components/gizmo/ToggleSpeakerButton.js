import React from 'react';
import Tooltip from 'components/Tooltip';
import GizmoPushButton from 'components/gizmo/GizmoPushButton';
import { setSpeakerMuted, useGizmoController } from 'components/gizmo/GizmoController';
import { ReactComponent as DarkSpeakerIcon } from 'assets/speaker-icon-navy.svg';
import { ReactComponent as LightSpeakerIcon } from 'assets/speaker-icon-white.svg';

export default function ToggleSpeakerButton() {
  const { dispatch, isSpeakerMuted, isStick } = useGizmoController();

  const label = isSpeakerMuted ? 'Unmute audio' : 'Mute audio';

  return (
    <Tooltip label={label} placement={isStick ? 'left' : 'top'}>
      <GizmoPushButton
        aria-label={label}
        strike={isSpeakerMuted}
        darken={isSpeakerMuted}
        onClick={() => dispatch(setSpeakerMuted(!isSpeakerMuted))}
      >
        {isSpeakerMuted ? <LightSpeakerIcon /> : <DarkSpeakerIcon />}
      </GizmoPushButton>
    </Tooltip>
  );
}
