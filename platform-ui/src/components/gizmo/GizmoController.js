import React from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import 'webrtc-adapter';
import FloatingButton from 'components/gizmo/FloatingButton';
import Popout from 'components/gizmo/Popout';
import { useApplicationContext, pushSnackError } from 'ApplicationContext';

const defaultGizmoControllerContext = {
  hasSocketDisconnected: false,
  isOpen: false,
  isStick: false,
  isSpeakerMuted: false,
  isCameraDisabled: true,
  isMicrophoneMuted: true,
  isVideoChatConnected: false,
  isViewingBreakoutRooms: false,
  mediaStream: null,
  socket: null,
  videoRoom: 'main',
  videoRoomParticipants: [],
  chatRoom: 'general',
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

const SET_SPEAKER_MUTED = 'SET_SPEAKER_MUTED';
export function setSpeakerMuted(isSpeakerMuted) {
  return { type: SET_SPEAKER_MUTED, isSpeakerMuted };
}

const SET_MICROPHONE_MUTED = 'SET_MICROPHONE_MUTED';
export function setMicrophoneMuted(isMicrophoneMuted) {
  return { type: SET_MICROPHONE_MUTED, isMicrophoneMuted };
}

const SET_CAMERA_DISABLED = 'SET_CAMERA_DISABLED';
export function setCameraDisabled(isCameraDisabled) {
  return { type: SET_CAMERA_DISABLED, isCameraDisabled };
}

const CONNECT_VIDEO_CHAT = 'CONNECT_VIDEO_CHAT';
export function connectToVideoChat(mediaStream) {
  return { type: CONNECT_VIDEO_CHAT, mediaStream };
}

const DISCONNECT_VIDEO_CHAT = 'DISCONNECT_VIDEO_CHAT';
export function disconnectFromVideoChat() {
  return { type: DISCONNECT_VIDEO_CHAT };
}

const SET_VIEWING_BREAKOUT_ROOMS = 'SET_VIEWING_BREAKOUT_ROOMS';
export function setViewingBreakoutRooms(isViewingBreakoutRooms) {
  return { type: SET_VIEWING_BREAKOUT_ROOMS, isViewingBreakoutRooms };
}

const SET_SOCKET = 'SET_SOCKET';
function setSocket(socket) {
  return { type: SET_SOCKET, socket };
}

const SET_SOCKET_DISCONNECTED = 'SET_SOCKET_DISCONNECTED';
function setSocketDisconnected(hasSocketDisconnected) {
  return { type: SET_SOCKET_DISCONNECTED, hasSocketDisconnected };
}

const SET_VIDEO_ROOM = 'SET_VIDEO_ROOM';
export function setVideoRoom(videoRoom) {
  return { type: SET_VIDEO_ROOM, videoRoom };
}

const SET_VIDEO_PARTICIPANTS = 'SET_VIDEO_PARTICIPANTS';
export function setVideoParticipants(videoRoomParticipants) {
  return { type: SET_VIDEO_PARTICIPANTS, videoRoomParticipants };
}

function gizmoReducer(state, action) {
  switch (action.type) {
    case CONNECT_VIDEO_CHAT:
      const { mediaStream } = action;

      return {
        ...state,
        mediaStream,
        isVideoChatConnected: true,
      };

    case DISCONNECT_VIDEO_CHAT:
      return {
        ...state,
        isVideoChatConnected: false,
        mediaStream: null,
        videoRoom: 'default',
        videoRoomParticipants: [],
      };

    case SET_CAMERA_DISABLED:
      const { isCameraDisabled } = action;
      return { ...state, isCameraDisabled };

    case SET_SPEAKER_MUTED:
      const { isSpeakerMuted } = action;
      return { ...state, isSpeakerMuted };

    case SET_MICROPHONE_MUTED:
      const { isMicrophoneMuted } = action;
      return { ...state, isMicrophoneMuted };

    case SET_OPEN:
      const { isOpen } = action;

      return {
        ...state,
        isOpen,
        isVideoChatConnected: isOpen ? state.isVideoChatConnected : false,
        isCameraDisabled: isOpen ? state.isCameraDisabled : true,
        isMicrophoneMuted: isOpen ? state.isMicrophoneMuted : true,
        isViewingBreakoutRooms: isOpen ? state.isViewingBreakoutRooms : false,
      };

    case SET_SOCKET:
      const { socket } = action;
      return { ...state, socket };

    case SET_SOCKET_DISCONNECTED:
      const { hasSocketDisconnected } = action;
      return { ...state, hasSocketDisconnected };

    case SET_STICK:
      const { isStick } = action;
      return { ...state, isStick };

    case SET_VIEWING_BREAKOUT_ROOMS:
      const { isViewingBreakoutRooms } = action;
      return { ...state, isViewingBreakoutRooms };

    case SET_VIDEO_ROOM:
      const { videoRoom } = action;

      return {
        ...state,
        videoRoom,
        videoRoomParticipants: [],
      };

    case SET_VIDEO_PARTICIPANTS:
      const { videoRoomParticipants } = action;
      return { ...state, videoRoomParticipants };

    default:
      return state;
  }
}

export default function GizmoController(props) {
  const { activeCampaign } = props;

  const [state, dispatch] = React.useReducer(gizmoReducer, defaultGizmoControllerContext);

  const contextValue = {
    ...state,
    dispatch,
  };

  const {
    authentication: { token },
    dispatch: dispatchApplication,
  } = useApplicationContext();

  React.useEffect(() => {
    let connection = state.socket;

    if (!state.socket && token) {
      connection = io(`${process.env.REACT_APP_SOCKET_URL}?bearer=${token}`);
      dispatch(setSocket(connection));
    }

    if (connection) {
      connection.on('error', (error) => {
        console.error(error);
        pushSnackError(dispatchApplication, error);
      });

      connection.on('exception', (error) => {
        console.error(error);
        pushSnackError(dispatchApplication, error);
      });

      connection.on('disconnect', () => {
        dispatch(setSocketDisconnected(true));
        pushSnackError(dispatchApplication, 'Disconnected from chat server, attempting reconnection...');
      });

      return () => {
        connection.removeListener('error');
        connection.removeListener('exception');
        connection.removeListener('disconnect');
      };
    }
  }, [
    state.socket,
    token,
    dispatch,
    dispatchApplication,
  ]);

  React.useEffect(() => {
    if (state.socket && activeCampaign && activeCampaign.id) {
      state.socket.emit('join-campaign', activeCampaign.id);

      function onConnect() {
        dispatch(setSocketDisconnected(false));
        state.socket.emit('join-campaign', activeCampaign.id);
      }

      state.socket.on('connect', onConnect);
      return () => state.socket.removeListener('connect', onConnect);
    }
  }, [
    dispatch,
    state.socket,
    activeCampaign,
  ]);

  React.useEffect(() => {
    if (!state.mediaStream) {
      return;
    }

    state.mediaStream.getAudioTracks().forEach((track) => {
      track.enabled = !state.isMicrophoneMuted;
    });

    state.mediaStream.getVideoTracks().forEach((track) => {
      track.enabled = !state.isCameraDisabled;
    });
  }, [
    state.mediaStream,
    state.isMicrophoneMuted,
    state.isCameraDisabled,
  ]);

  React.useEffect(() => {
    if (state.socket && !state.isVideoChatConnected) {
      state.socket.emit('leave-video-room');
    }
  }, [
    state.socket,
    state.isVideoChatConnected,
    state.isOpen,
  ]);

  return (
    <Container>
      <GizmoControllerContext.Provider value={contextValue}>
        <Popout />
        <FloatingButton />
      </GizmoControllerContext.Provider>
    </Container>
  );
}
