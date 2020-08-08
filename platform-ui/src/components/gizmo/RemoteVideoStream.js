import React from 'react';
import VideoStream from 'components/gizmo/VideoStream';
import { useGizmoController } from 'components/gizmo/GizmoController';
import usePrevious from 'hooks/usePrevious';

function constructRTCPeerConnection(mediaStream) {
  const connection = new RTCPeerConnection({
    iceServers: [{ 'urls': 'stun:stun.l.google.com:19302' }],
  });

  mediaStream.getTracks()
    .forEach((track) => connection.addTrack(track, mediaStream));

  return connection;
}

export default function RemoteVideoStream(props) {
  const {
    localJoinedRoomAt,
    account: {
      id,
      firstName,
      lastName,
      avatarUrl,
      joinedRoomAt,
    },
  } = props;

  const previousId = usePrevious(id);

  const {
    dispatch,
    mediaStream,
    socket,
    videoRoom,
  } = useGizmoController();

  const [isPeerConntected, setIsPeerConntected] = React.useState(false);

  const hasMadeOffer = React.useRef(false);

  const peerConnection = React.useRef(constructRTCPeerConnection(mediaStream));
  const peerMediaStream = React.useRef(new MediaStream());

  React.useEffect(() => {
    return () => peerConnection.current.close();
  }, []);

  React.useEffect(() => {
    if (id !== previousId) {
      peerConnection.current.close();
      peerConnection.current = constructRTCPeerConnection(mediaStream);

      hasMadeOffer.current = false;

      setIsPeerConntected(false);
    }

    function onTrack(event) {
      peerMediaStream.current.addTrack(event.track, peerMediaStream.current);
    }

    peerConnection.current.addEventListener('track', onTrack);

    return () => peerConnection.current.removeEventListener('track', onTrack);
  }, [
    id,
    mediaStream,
    previousId,
    setIsPeerConntected,
  ]);

  React.useEffect(() => {
    if (!id || !socket) {
      return;
    }

    function onIceCandidate(event) {
      if (event.candidate) {
        socket.emit('rtc-ice-candidate', id, event.candidate.toJSON());
      }
    }

    peerConnection.current.addEventListener('icecandidate', onIceCandidate);

    async function onRemoteIceCandidate(candidate) {
      await peerConnection.current.addIceCandidate(candidate);
    }

    const remoteIceCandidateEvent = `rtc-ice-candidate-from-${id}`;
    socket.on(remoteIceCandidateEvent, onRemoteIceCandidate);

    return () => {
      peerConnection.current.removeEventListener('icecandidate', onIceCandidate);
      socket.removeListener(remoteIceCandidateEvent, onRemoteIceCandidate);
    }
  }, [
    id,
    socket,
  ]);

  React.useEffect(() => {
    if (!socket || !joinedRoomAt || !localJoinedRoomAt) {
      return;
    }

    async function makeOffer() {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit(`rtc-offer-sent`, id, offer.toJSON());
    }

    if (localJoinedRoomAt > joinedRoomAt && !hasMadeOffer.current) {
      hasMadeOffer.current = true;
      makeOffer();
    }
  }, [
    id,
    socket,
    videoRoom,
    joinedRoomAt,
    localJoinedRoomAt,
  ]);

  React.useEffect(() => {
    async function onAnswer(answer) {
      await peerConnection.current.setRemoteDescription(answer);
    }

    async function onOffer(offer) {
      await peerConnection.current.setRemoteDescription(offer);

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit(`rtc-answer-sent`, id, answer.toJSON());
    }

    const answerEvent = `rtc-answer-from-${id}`;
    socket.on(answerEvent, onAnswer);

    const offerEvent = `rtc-offer-from-${id}`;
    socket.on(offerEvent, onOffer);

    return () => {
      socket.removeListener(answerEvent, onAnswer);
      socket.removeListener(offerEvent, onOffer);
    }
  }, [
    id,
    socket,
  ]);

  React.useEffect(() => {
    function onConnectionStateChange(event) {
      if (peerConnection.current.connectionState === 'connected') {
        setIsPeerConntected(true);
      } else if (isPeerConntected) {
        setIsPeerConntected(false);
      }
    }
    peerConnection.current.addEventListener('connectionstatechange', onConnectionStateChange);

    return () => peerConnection.current.removeEventListener('connectionstatechange', onConnectionStateChange);
  }, [
    id,
    isPeerConntected,
    setIsPeerConntected,
  ]);

  return (
    <VideoStream
      name={`${firstName}${lastName ? ` ${lastName}` : ''}`}
      avatarUrl={avatarUrl}
      mediaStream={isPeerConntected ? peerMediaStream.current : null}
      isMicrophoneMuted={false}
      isVideoDisabled={false}
      muteAudio
    />
  );
}
