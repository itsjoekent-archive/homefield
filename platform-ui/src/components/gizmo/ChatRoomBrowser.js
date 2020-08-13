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
  setViewingChatRooms,
  setChatRoom,
} from 'components/gizmo/GizmoController';

export default function ChatRoomBrowser() {
  const {
    activeCampaign,
    dispatch,
    socket,
    chatRoom,
  } = useGizmoController();

  const [roomData, setRoomData] = React.useState(null);

  React.useEffect(() => {
    if (!socket || roomData) {
      return;
    }

    function onData(data) {
      setRoomData(data);
    }

    socket.on('all-chat-room-counts', onData);
    socket.emit('get-all-chat-room-counts');

    return () => socket.removeListener('all-chat-room-counts', onData);
  }, [
    socket,
    roomData,
    setRoomData,
  ]);

  function onClose() {
    dispatch(setViewingChatRooms(false));
  }

  function onSelect(title) {
    dispatch(setChatRoom(title));
    onClose();
  }

  function getCount(title) {
    if (!roomData) {
      return;
    }

    return roomData[title] || 0;
  }

  return (
    <BrowserList>
      <TitleRow>
        <Title>Browse chat channels</Title>
        <CloseButton onClick={onClose}>
          Close
        </CloseButton>
      </TitleRow>
      {activeCampaign && activeCampaign.chatChannels.map((room) => (
        <BrowserCard
          key={room.title}
          highlight={chatRoom === room.title}
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
