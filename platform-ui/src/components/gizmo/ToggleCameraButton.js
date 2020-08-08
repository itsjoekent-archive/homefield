import React from 'react';
import Tooltip from 'components/Tooltip';
import GizmoPushButton from 'components/gizmo/GizmoPushButton';
import { setCameraDisabled, useGizmoController } from 'components/gizmo/GizmoController';
import { ReactComponent as DarkCameraIcon } from 'assets/camera-icon-navy.svg';
import { ReactComponent as LightCameraIcon } from 'assets/camera-icon-white.svg';

export default function ToggleCameraButton() {
  const { dispatch, isCameraDisabled, isStick } = useGizmoController();

  const label = isCameraDisabled ? 'Resume camera' : 'Stop camera';

  return (
    <Tooltip label={label} placement={isStick ? 'left' : 'top'}>
      <GizmoPushButton
        aria-label={label}
        strike={isCameraDisabled}
        darken={isCameraDisabled}
        onClick={() => dispatch(setCameraDisabled(!isCameraDisabled))}
      >
        {isCameraDisabled ? <LightCameraIcon /> : <DarkCameraIcon />}
      </GizmoPushButton>
    </Tooltip>
  );
}
