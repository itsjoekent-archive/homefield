import React from 'react';
import Tooltip from 'components/Tooltip';
import GizmoPushButton from 'components/gizmo/GizmoPushButton';
import { connectToVideoChat, disconnectFromVideoChat, useGizmoController } from 'components/gizmo/GizmoController';
import { ReactComponent as DisconnectBroadcastStatusIcon } from 'assets/broadcast-status-icon-red.svg';
import { ReactComponent as ConnectBroadcastStatusIcon } from 'assets/broadcast-status-icon-white.svg';

export default function ToggleVideoChatConnectedButton() {
  const { dispatch, isVideoChatConnected, mediaStream } = useGizmoController();

  const label = isVideoChatConnected ? 'Disconnect from video' : 'Reconnect';

  function onClick() {
    if (isVideoChatConnected) {
      if (mediaStream) {
        const tracks = mediaStream.getTracks();

        tracks.forEach((track) => track.stop());
      }

      return disconnectFromVideoChat();
    } else {
      return connectToVideoChat();
    }
  }

  return (
    <Tooltip label={label} placement="top">
      <GizmoPushButton
        aria-label={label}
        darken={!isVideoChatConnected}
        onClick={() => dispatch(onClick())}
      >
        {isVideoChatConnected ? <DisconnectBroadcastStatusIcon /> : <ConnectBroadcastStatusIcon />}
      </GizmoPushButton>
    </Tooltip>
  );
}
