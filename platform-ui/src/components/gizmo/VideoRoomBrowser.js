import React from 'react';
import {
  BrowserList,
  TitleRow,
  Title,
  CloseButton,
  BrowserCard,
  BrowserCardTitle,
  BrowserCardDescription,
  BrowserCardStatus,
  BrowserCardStatusLabel,
  BrowserCardLayout,
} from 'components/gizmo/BrowserStyledComponents';
import {
  useGizmoController,
  setViewingVideoRooms,
  setVideoRoom,
} from 'components/gizmo/GizmoController';

export default function VideoRoomBrowser() {
  const { activeCampaign, videoRoom, socket, dispatch } = useGizmoController();
  const [roomData, setRoomData] = React.useState(null);

  React.useEffect(() => {
    if (!socket || roomData) {
      return;
    }

    function onData(data) {
      setRoomData(data);
    }

    socket.on('all-video-rooms-data', onData);
    socket.emit('all-video-rooms');

    return () => socket.removeListener('all-video-rooms-data', onData);
  }, [
    socket,
    roomData,
    setRoomData,
  ]);

  function onClose() {
    dispatch(setViewingVideoRooms(false))
  }

  function onSelect(title) {
    dispatch(setVideoRoom(title));
    onClose();
  }

  function getCount(title) {
    if (!roomData) {
      return;
    }

    return (roomData[title] || []).length;
  }

  return (
    <BrowserList>
      <TitleRow>
        <Title>Browse video rooms</Title>
        <CloseButton onClick={onClose}>
          Close
        </CloseButton>
      </TitleRow>
      {activeCampaign && activeCampaign.videoRooms.map((room) => (
        <BrowserCard
          key={room.title}
          highlight={videoRoom === room.title}
          onClick={() => onSelect(room.title)}
        >
          <BrowserCardLayout>
            <BrowserCardTitle>{room.title}</BrowserCardTitle>
            <BrowserCardDescription>{room.description}</BrowserCardDescription>
          </BrowserCardLayout>
          {!!getCount(room.title) && (
            <BrowserCardStatus>
              <BrowserCardStatusLabel>{getCount(room.title)} volunteer{getCount(room.title) === 1 ? '' : 's' } in this room</BrowserCardStatusLabel>
            </BrowserCardStatus>
          )}
        </BrowserCard>
      ))}
    </BrowserList>
  );
}
