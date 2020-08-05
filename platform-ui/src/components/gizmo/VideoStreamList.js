import React from 'react';
import styled from 'styled-components';
import VideoStream from 'components/gizmo/VideoStream';
import { useGizmoController } from 'components/gizmo/GizmoController';

export default function VideoStreamList() {
  const { mediaStream } = useGizmoController();

  return (
    <VideoStream
      name="Joe Kent"
      videoStream={mediaStream}
      isMicrophoneMuted={false}
      isVideoDisabled={false}
      muteAudio={true}
    />
  )
}
