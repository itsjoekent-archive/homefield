import React from 'react';
import styled, { css } from 'styled-components';
import { Container as VideoStreamContainer } from 'components/gizmo/VideoStream';
import LocalVideoStream from 'components/gizmo/LocalVideoStream';
import RemoteVideoStream from 'components/gizmo/RemoteVideoStream';
import { setVideoParticipants, useGizmoController } from 'components/gizmo/GizmoController';
import usePrevious from 'hooks/usePrevious';
import { useApplicationContext } from 'ApplicationContext';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;

  overflow-x: scroll;

  padding: 12px;
  padding-top: 6px;

  ${VideoStreamContainer} {
    margin-right: 12px;
  }

  ${({ isStick }) => isStick && css`
    flex-direction: column;
    flex-grow: 1;
    align-items: center;

    overflow-x: auto;
    overflow-y: scroll;

    ${VideoStreamContainer} {
      margin-right: 0;
      margin-bottom: 12px;
    }
  `}
`;

export default function VideoStreamList() {
  const { authentication: { account } } = useApplicationContext();

  const {
    dispatch,
    isVideoChatConnected,
    socket,
    videoRoom,
    videoRoomParticipants,
    isCameraDisabled,
    isMicrophoneMuted,
    isSpeakerMuted,
    isStick,
  } = useGizmoController();

  const previousVideoRoom = usePrevious(videoRoom);

  React.useEffect(() => {
    if (!socket) {
      return;
    }

    if (isVideoChatConnected && videoRoom) {
      socket.emit('join-video-room', videoRoom, );
      return;
    }

    if (isVideoChatConnected && (videoRoom !== previousVideoRoom)) {
      // TODO: Disconnect from peer streams
      socket.emit('join-video-room', videoRoom);
      return;
    }
  }, [
    isVideoChatConnected,
    videoRoom,
    previousVideoRoom,
    socket,
  ]);

  React.useEffect(() => {
    if (!socket || !isVideoChatConnected) {
      return;
    }

    const syncEvent = `video-${videoRoom}-sync`;

    function onSync(data) {
      const { videoRoomParticipants } = data;
      dispatch(setVideoParticipants(videoRoomParticipants));
    }

    socket.on(syncEvent, onSync);
    return () => socket.removeListener(syncEvent, onSync);
  }, [
    dispatch,
    isVideoChatConnected,
    socket,
    videoRoom,
  ]);

  React.useEffect(() => {
    if (!isVideoChatConnected || !socket) {
      return;
    }

    const selfParticipant = videoRoomParticipants.find((participant) => (
      participant.id === account.id
    ));

    if (!videoRoomParticipants || !selfParticipant) {
      return;
    }

    if (
      selfParticipant.isCameraDisabled !== isCameraDisabled
      || selfParticipant.isMicrophoneMuted !== isMicrophoneMuted
      || selfParticipant.isSpeakerMuted !== isSpeakerMuted
    ) {
      socket.emit('video-room-status-update', isMicrophoneMuted, isCameraDisabled, isSpeakerMuted);
    }
  }, [
    account.id,
    isVideoChatConnected,
    socket,
    videoRoomParticipants,
    isCameraDisabled,
    isMicrophoneMuted,
    isSpeakerMuted,
  ]);

  const remoteParticipants = videoRoomParticipants
    && videoRoomParticipants.filter((participant) => participant.id !== account.id);

  const { joinedRoomAt } = videoRoomParticipants
    .find((participant) => participant.id === account.id) || {};

  return (
    <Container isStick={isStick}>
      <LocalVideoStream />
      {remoteParticipants && remoteParticipants.map((participant) => (
        <RemoteVideoStream
          key={participant.id}
          account={participant}
          localJoinedRoomAt={joinedRoomAt}
        />
      ))}
    </Container>
  );
}
