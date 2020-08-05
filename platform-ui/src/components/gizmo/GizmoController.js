import React from 'react';
import styled from 'styled-components';
import FloatingButton from 'components/gizmo/FloatingButton';
import Popout from 'components/gizmo/Popout';

const defaultGizmoControllerContext = {
  isOpen: false,
  isStick: false,
  isMuted: true,
  isBroadcasting: false,
  isVideoConnected: false,
  isViewingBreakoutRooms: false,
  mediaStream: null,
};

export const GizmoControllerContext = React.createContext(defaultGizmoControllerContext);

const Container = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: ${({ theme }) => theme.zIndex.hub};

  padding: 12px;
`;

export function useGizmoController() {
  const context = React.useContext(GizmoControllerContext);

  return context;
}

const SET_OPEN = 'SET_OPEN';
export function setIsGizmoOpen(isOpen) {
  return { type: SET_OPEN, isOpen };
}

const SET_STICK = 'SET_STICK';
export function setStick(isStick) {
  return { type: SET_STICK, isStick };
}

const SET_MUTE = 'SET_MUTE';
export function setMute(isMuted) {
  return { type: SET_MUTE, isMuted };
}

const SET_BROADCAST = 'SET_BROADCAST';
export function setBroadcast(isBroadcasting) {
  return { type: SET_BROADCAST, isBroadcasting };
}

const CONNECT_VIDEO = 'CONNECT_VIDEO';
export function connectToVideo(mediaStream) {
  return { type: CONNECT_VIDEO, mediaStream };
}

const DISCONNECT_VIDEO = 'DISCONNECT_VIDEO';
export function disconnectFromVideo() {
  return { type: DISCONNECT_VIDEO };
}

const SET_VIEWING_BREAKOUT_ROOMS = 'SET_VIEWING_BREAKOUT_ROOMS';
export function setViewingBreakoutRooms(isViewingBreakoutRooms) {
  return { type: SET_VIEWING_BREAKOUT_ROOMS, isViewingBreakoutRooms };
}

function gizmoReducer(state, action) {
  switch (action.type) {
    case SET_OPEN:
      const { isOpen } = action;

      return {
        ...state,
        isOpen,
        isBroadcasting: isOpen ? state.isBroadcasting : false,
        isMuted: isOpen ? state.isMuted : false,
        isViewingBreakoutRooms: isOpen ? state.isViewingBreakoutRooms : false,
      };
    case SET_STICK:
      const { isStick } = action;
      return { ...state, isStick };

    case SET_MUTE:
      const { isMuted } = action;
      return { ...state, isMuted };

    case SET_BROADCAST:
      const { isBroadcasting } = action;
      return { ...state, isBroadcasting };

    case CONNECT_VIDEO:
      const { mediaStream } = action;

      return {
        ...state,
        isVideoConnected: true,
        mediaStream,
      };

    case DISCONNECT_VIDEO:
      return {
        ...state,
        isVideoConnected: false,
        mediaStream: null,
      };

    case SET_VIEWING_BREAKOUT_ROOMS:
      const { isViewingBreakoutRooms } = action;
      return { ...state, isViewingBreakoutRooms };

    default:
      return state;
  }
}

export default function GizmoController(props) {
  const [state, dispatch] = React.useReducer(gizmoReducer, defaultGizmoControllerContext);

  const contextValue = { ...state, dispatch };

  return (
    <Container>
      <GizmoControllerContext.Provider value={contextValue}>
        <Popout />
        <FloatingButton />
      </GizmoControllerContext.Provider>
    </Container>
  );
}
