import React from 'react';
import styled from 'styled-components';
import LocalVideoStream from 'components/gizmo/LocalVideoStream';
import RemoteVideoStream from 'components/gizmo/RemoteVideoStream';
import { setVideoParticipants, useGizmoController } from 'components/gizmo/GizmoController';
import usePrevious from 'hooks/usePrevious';
import { useApplicationContext } from 'ApplicationContext';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

export default function VideoStreamList() {
  const { authentication: { account } } = useApplicationContext();

  const {
    dispatch,
    isVideoChatConnected,
    socket,
    videoRoom,
    videoRoomParticipants,
  } = useGizmoController();

  const previousVideoRoom = usePrevious(videoRoom);

  React.useEffect(() => {
    if (!socket) {
      return;
    }

    if (isVideoChatConnected && videoRoom) {
      socket.emit('join-video-room', videoRoom);
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

  const remoteParticipants = videoRoomParticipants
    && videoRoomParticipants.filter((participant) => participant.id !== account.id);

  const { joinedRoomAt } = videoRoomParticipants
    .find((participant) => participant.id === account.id) || {};

  return (
    <Container>
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
