import React from 'react';
import Tooltip from 'components/Tooltip';
import GizmoPushButton from 'components/gizmo/GizmoPushButton';
import { setViewingVideoRooms, useGizmoController } from 'components/gizmo/GizmoController';
import { ReactComponent as DarkBreakoutRoomIcon } from 'assets/breakout-rooms-icon-navy.svg';
import { ReactComponent as LightBroadcastIcon } from 'assets/breakout-rooms-icon-white.svg';

export default function ToggleVideoRoomsButton() {
  const { dispatch, isViewingVideoRooms } = useGizmoController();

  const label = isViewingVideoRooms ? 'Hide video rooms' : 'Browse video rooms';

  return (
    <Tooltip label={label} placement="left">
      <GizmoPushButton
        aria-label={label}
        strike={isViewingVideoRooms}
        darken={isViewingVideoRooms}
        onClick={() => dispatch(setViewingVideoRooms(!isViewingVideoRooms))}
      >
        {isViewingVideoRooms ? <LightBroadcastIcon /> : <DarkBreakoutRoomIcon />}
      </GizmoPushButton>
    </Tooltip>
  );
}
