import React, { useEffect, useCallback, useState, useMemo } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { Box, Button, Container, Image, Text, useBreakpointValue } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faCamera , faComment, faPhoneSlash, faCameraAlt } from "@fortawesome/free-solid-svg-icons";
import { formatTime } from "../util/FormatTime";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [message, setMessage] = useState("broooo");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userDetails, setUserDetails] = useState({name: "",email: ""});
  
  const [openChat, setopenChat] = useState(false);
  const [callButtonDisplay, setCallButtonDisplay] = useState(true)
  const [micOn,setMicOn]  = useState(true)
  const [cameraOn,setCameraOn]  = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const handleUserJoined = useCallback(({ email, id }) => {
    setIsAdmin(true)
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    setCallButtonDisplay(false)
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  const handleIncomingMessage = (message) => {
    console.log(message);
  };

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  const toggleCamera = () => {
    const videoTracks = myStream.getVideoTracks();
    if (videoTracks.length > 0) {
      const isEnabled = videoTracks[0].enabled;
      videoTracks.forEach((track) => {
        track.enabled = !isEnabled;
      });
      setMyStream(
        new MediaStream(myStream.getAudioTracks().concat(videoTracks))
      );
    }

    setCameraOn(!cameraOn)
  };

  const toggleAudio = () => {

    const audioTrack = myStream.getAudioTracks()[0];

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMyStream(new MediaStream([myStream.getVideoTracks()[0], audioTrack]));
    }
    setMicOn(!micOn)
  };

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("incoming:message", handleIncomingMessage);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("incoming:message", handleIncomingMessage);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  const sendMessage = () => {
    if (socket) {
      socket.emit("send-message", { remoteSocketId, message });
      console.log("clicked",{remoteSocketId,message})
      setMessage(""); // Clear input after sending the message
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newTime = new Date();
      if (newTime.getTime() !== currentTime.getTime()) {
        setCurrentTime(newTime);
      }
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [currentTime]);


  const renderVideo = useMemo(
    () => (
      <Box>
        <video
          className="video"
          autoPlay
          playsInline
          muted
          height="100%"
          width="100%"
          ref={(videoRef) => videoRef && (videoRef.srcObject = myStream)}
        />
      </Box>
    ),
    [myStream]
  );

  const renderSendvideo = useMemo(
    () => (
      <Box>
        <video
          className="video"
          autoPlay
          playsInline
          height="100%"
          width="100%"
          ref={(videoRef) => videoRef && (videoRef.srcObject = remoteStream)}
        />
      </Box>
    ),
    [remoteStream]
  );

  return (
    <Box
      display={"flex"}
      // flexDirection={"row"}
      justifyContent={"center"}
      height={"100vh"}
      backgroundColor={"#121212"}
      overflowX={"hidden"}
    >

      <Box
      display={"flex"}
      justifyContent={"center"}
      maxWidth={"1500px"}
      width={"100%"}
      >

      <Box 
      width={openChat? {base:"10%",sm:"40%", md:"60%",lg:"70%"}:"100%"}
      transition="width 0.3s ease, transform 0.3s ease"

      >
        <Box
          width={"100%"}
          height={"90vh"}
          display={"flex"}
          flexDirection={"row"}
        >
          <Box
            flex={"1"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            padding={1}
          >
            {myStream && renderVideo}
          </Box>
          <Box
            flex={"1"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            padding={1}
          >
            {remoteStream && renderSendvideo}
          </Box>
        </Box>

        <Box display={"flex"} flexDirection={"row"}>
          <Box
            flex={"1"}
            display={"flex"}
            justifyContent={"flex-start"}
            alignItems={"center"}
            paddingLeft={10}
          >
            <Text color={"white"} display={{ base: "none", md: "block" }}>
              {formatTime(currentTime)} | room id
            </Text>
          </Box>

          <Box
            flex={"1"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Box
              borderRadius={"50%"}
              backgroundColor={micOn?"#2e2e2e":"#FF5449"}
              // padding={"15px"}
              height={"50px"}
              width={"50px"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              onClick={toggleAudio}
              _hover={{
                cursor:"pointer"
              }}
            >
              <FontAwesomeIcon icon={faMicrophone} color="white" />
            </Box>

            <Box
              borderRadius={"50%"}
              backgroundColor={cameraOn?"#2e2e2e":"#FF5449"}
              height={"50px"}
              width={"50px"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}              
              marginLeft={"10px"}
              onClick={toggleCamera}
              _hover={{
                cursor:"pointer"
              }}
            >
              <FontAwesomeIcon icon={faCamera} color="white" />

            </Box>

            <Box
              borderRadius={"50%"}
              backgroundColor={"#2e2e2e"}
              height={"50px"}
              width={"50px"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}        
              marginLeft={"10px"}
              _hover={{
                cursor:"pointer"
              }}
              onClick={() => setopenChat(!openChat)}
            >
              <FontAwesomeIcon icon={faComment} color="white" />
            </Box>

            <Box
              borderRadius={"50%"}
              backgroundColor={"#FF5449"}
              height={"45px"}
              width={"48px"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              marginLeft={"10px"}
              _hover={{
                cursor:"pointer"
              }}
            >
              <FontAwesomeIcon icon={faPhoneSlash} color="white" />
            </Box>
          </Box>

          <Box flex={"1"}>
            {myStream  && !isAdmin && <Button onClick={sendStreams}>Send Stream</Button>}
            {remoteSocketId && isAdmin && <Button onClick={handleCallUser}>CALL</Button>}
          </Box>
        </Box>
      </Box>
        <Box
        backgroundColor={"#2e2e2e"}
        // width={openChat?"30%":"0"}
        width={openChat? {base:"90%",sm:"60%", md:"40%",lg:"30%"}:"0"}

          transition="width 0.3s ease, transform 0.3s ease"
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          
        >
          <Box
          backgroundColor={"white"}
          height={"80%"}
          width={"80%"}
          borderRadius={"2rem"}
          >
            <Button onClick={sendMessage}>Send</Button>

          </Box>
        </Box>
              
        </Box>
    </Box>
  );
};

export default RoomPage;

