import React from 'react';
import VideoStream from 'components/gizmo/VideoStream';
import { useGizmoController } from 'components/gizmo/GizmoController';
import { useApplicationContext } from 'ApplicationContext';

export default function LocalVideoStream() {
  const {
    mediaStream,
    isCameraDisabled,
    isMicrophoneMuted,
    isSpeakerMuted,
  } = useGizmoController();

  const {
    authentication: {
      account: {
        firstName,
        lastName,
        avatarUrl,
      },
    },
  } = useApplicationContext();

  return (
    <VideoStream
      name={`${firstName}${lastName ? ` ${lastName}` : ''}`}
      avatarUrl={avatarUrl}
      mediaStream={mediaStream}
      isMicrophoneMuted={isMicrophoneMuted}
      isCameraDisabled={isCameraDisabled}
      isSpeakerMuted={isSpeakerMuted}
      muteAudio
    />
  );
}
