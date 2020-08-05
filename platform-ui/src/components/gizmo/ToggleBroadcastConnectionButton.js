import React from 'react';
import Tooltip from 'components/Tooltip';
import GizmoPushButton from 'components/gizmo/GizmoPushButton';
import { connectToVideo, disconnectFromVideo, useGizmoController } from 'components/gizmo/GizmoController';
import { ReactComponent as DisconnectBroadcastStatusIcon } from 'assets/broadcast-status-icon-red.svg';
import { ReactComponent as ConnectBroadcastStatusIcon } from 'assets/broadcast-status-icon-white.svg';

export default function ToggleBroadcastConnectionButton() {
  const { dispatch, isVideoConnected, mediaStream } = useGizmoController();

  const label = isVideoConnected ? 'Disconnect from video' : 'Reconnect';

  function onClick() {
    if (isVideoConnected) {
      if (mediaStream) {
        const tracks = mediaStream.getTracks();

        tracks.forEach((track) => track.stop());
      }

      return disconnectFromVideo();
    } else {
      return connectToVideo();
    }
  }

  return (
    <Tooltip label={label} placement="top">
      <GizmoPushButton
        aria-label={label}
        darken={!isVideoConnected}
        onClick={() => dispatch(onClick())}
      >
        {isVideoConnected ? <DisconnectBroadcastStatusIcon /> : <ConnectBroadcastStatusIcon />}
      </GizmoPushButton>
    </Tooltip>
  );
}
