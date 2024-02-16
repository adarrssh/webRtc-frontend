import React, { useEffect, useCallback, useState, useMemo } from "react";
import peer from "../../service/peer";
import { useSocket } from "../../context/SocketProvider";
import { Box, Button, Image, Text, useToast } from "@chakra-ui/react";
import { formatTime } from "../../util/FormatTime";
import ChatBox from "../Chat/ChatBox";
import VideoControls from "../Controls/VideoControls";
import TImeAndRoomId from "../Controls/TImeAndRoomId";
import { useNavigate } from "react-router-dom";
import cameraOffLeftAvatar from '../../Image/cameraOffLeftAvatar.png'
import cameraOffRightAvatar from '../../Image/cameraOffRightAvatar.png'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";

export const RoomPage = () => {
  const { socket, isAdmin, roomId, setRoomId } = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userDetails, setUserDetails] = useState({
    name: localStorage.getItem("username"),
    email: localStorage.getItem("email"),
  });

  const [openChat, setopenChat] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [senderMicOn, setSenderMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [senderCameraOn, setSenderCameraOn] = useState(true);
  const navigate = useNavigate()
  const toast = useToast()

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);


  const handleCallUser = useCallback(async () => {
    toast({
      title: "Please wait while the user accept the call",
      status: "success",
      duration: 4000,
      isClosable: true,
      position: "bottom",
    });
    setCallStarted(true);
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
    setCallAccepted(true);
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

  const handleIncomingMessage = ({ name, message }) => {
    console.log({ name, message });
    setChats([...chats, { name, message }]);
  };

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
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
    socket.emit("camera:toggle", { to: remoteSocketId })
    setCameraOn(!cameraOn);
  };

  const toggleAudio = () => {
    const audioTrack = myStream.getAudioTracks()[0];

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMyStream(new MediaStream([myStream.getVideoTracks()[0], audioTrack]));
    }
    socket.emit("mic:toggle", { to: remoteSocketId })

    setMicOn(!micOn);
  };

  const handleCallEnd = () => {
    socket.emit("end:call", { to: remoteSocketId })
    if (myStream) {
      myStream.getTracks().forEach(track => track.stop());
    }
    setRoomId("")
    toast({
      title: "Call ended: user left the chat",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
    navigate("/")
  }

  const handelSenderCamera = () => {
    setSenderCameraOn(!senderCameraOn)
  }

  const handelSenderMic = () => {
    setSenderMicOn(!senderMicOn)
  }


  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("incoming:message", handleIncomingMessage);
    socket.on("call:ended", handleCallEnd);
    socket.on("sender:cameraToggle", handelSenderCamera);
    socket.on("sender:micToggle", handelSenderMic);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("call:ended", handleCallEnd);
      socket.off("sender:cameraToggle", handelSenderCamera)
      socket.off("sender:micToggle", handelSenderMic)
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
    handleIncomingMessage,
    handleCallEnd,
    handelSenderCamera,
    handelSenderMic
  ]);

  const sendMessage = (event) => {
    if (message.length > 0) {
      if (socket) {
        setChats([...chats, { name: "you", message }]);
        socket.emit("send-message", {
          remoteSocketId,
          name: userDetails.name,
          message,
        });
        setMessage("");
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault()
      sendMessage()
    }
  }

  const handleSendButtonClick = () => {
    sendMessage()
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newTime = new Date();
      if (newTime.getTime() !== currentTime.getTime()) {
        setCurrentTime(newTime);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [currentTime]);


  const endCall = () => {
    socket.emit("end:call", { to: remoteSocketId })
    if (myStream) {
      myStream.getTracks().forEach(track => track.stop());
    }
    setRoomId("")
    navigate("/")
    toast({
      title: "Call ended",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
  }

  const renderVideo = useMemo(
    () => (

      cameraOn ?
        <Box
          width={{ base: "90%" }}
          height={{ base: "240px", sm: "40%", md: "40%", lg: "60%" }}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <video
            className="video"
            autoPlay
            playsInline
            ref={(videoRef) => videoRef && (videoRef.srcObject = myStream)}
          />
        </Box>
        :
        <Box
          // width={{ base: "90%", sm: "90%", "2xl": "600px" }}
          width={"90%"}
          // height={{ base: "80%", sm: "60%", md: "90%", lg: "100%" }}
          height={"90%"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          flexDirection={"column"}
          backgroundColor={"#2e2e2e"}
          borderRadius={"8px"}
        >
          <Box
            height={"10%"}
            width={"100%"}
            display={"flex"}
            justifyContent={"flex-end"}
            paddingRight={"20px"}
            paddingTop={"20px"}
          >
            {!micOn && <FontAwesomeIcon icon={faMicrophoneSlash} color="white" />}

          </Box>
          <Box
            height={"90%"}
            width={"100%"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Image src={cameraOffLeftAvatar}></Image>
          </Box>
        </Box>
    ),
    [myStream, micOn, cameraOn]
  );

  const renderSendvideo = useMemo(
    () => (
      senderCameraOn ?
        <Box
          width={{ base: "90%" }}
          height={{ base: "240px", sm: "40%", md: "40%", lg: "60%" }}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <video
            className="video"
            autoPlay
            playsInline
            ref={(videoRef) => videoRef && (videoRef.srcObject = remoteStream)}
          />
        </Box> :
        <Box
          // width={{ base: "90%", sm: "90%", "2xl": "600px" }}
          width={"90%"}
          // height={{ base: "80%", sm: "60%", md: "90%", lg: "100%" }}
          height={"90%"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          flexDirection={"column"}
          backgroundColor={"#2e2e2e"}
          borderRadius={"8px"}
        >
          <Box
            height={"10%"}
            width={"100%"}
            display={"flex"}
            justifyContent={"flex-end"}
            paddingRight={"20px"}
            paddingTop={"20px"}
          >
            {!senderMicOn && <FontAwesomeIcon icon={faMicrophoneSlash} color="white" />}

          </Box>
          <Box
            height={"90%"}
            width={"100%"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Image src={cameraOffRightAvatar}></Image>
          </Box>
        </Box>
    ),
    [remoteStream, senderMicOn, senderCameraOn]
  );

  return (
    <Box
      display={"flex"}
      justifyContent={"center"}
      height={"100vh"}
      backgroundColor={"#121212"}
      overflowX={"hidden"}
    >
      <Box
        display={"flex"}
        justifyContent={"center"}
        width={"100%"}
      >
        <Box
          width={
            openChat ? { base: "10%", sm: "40%", md: "60%", lg: "70%" } : "100%"
          }
          transition="width 0.3s ease, transform 0.3s ease"
        >
          <Box
            width={"100%"}
            height={{ base: "90vh", sm: "90vh" }}
            display={"flex"}
            flexDirection={{ base: "column", sm: "row" }}
            alignItems={{ base: "flex-start", sm: "center" }}
            justifyContent={"center"}
            borderRadius={"8px"}
          >
            {(isAdmin && callStarted) || (!isAdmin && callAccepted) ? (
              <>
                <Box
                  flex={"1"}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  padding={1}
                  // backgroundColor={"pink"}
                  height={!cameraOn ? { base: "30%", sm: "45%", md: "55%", lg: "70%", "xl": "90%", "2xl": "90%" } : ""}
                  width={!cameraOn ? "100%" : ""}
                >
                  {myStream && renderVideo}
                </Box>

                {remoteStream && <Box
                  flex={"1"}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  padding={1}
                  // backgroundColor={"pink"}
                  height={!senderCameraOn ? { base: "30%", sm: "45%", md: "55%", lg: "70%", "xl": "90%", "2xl": "90%" } : ""}
                  width={!senderCameraOn ? "100%" : ""}
                >
                  {renderSendvideo}
                </Box>}
              </>
            ) : (
              <>

                {isAdmin && (remoteSocketId === null) && !callStarted &&
                  (
                    <Box
                      width={"100%"}
                      height={"100%"}
                      display={"flex"}
                      flexDirection={"column"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >

                      <Text color={"white"} fontWeight={"bold"} >Please wait while the other user joins....</Text>
                      <Text color={"white"} fontWeight={"bold"} display={{ base: "block", sm: "none" }} >Your room id is : {roomId}</Text>
                    </Box>
                  )
                }

                {isAdmin && remoteSocketId && !callStarted &&
                  (
                    <Box
                      width={"100%"}
                      height={"100%"}
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}

                    >

                      <Button
                        onClick={handleCallUser}
                        display={callStarted ? "none" : "block"}
                      >
                        Start the CALL
                      </Button>
                    </Box>
                  )
                }


                {!isAdmin && !callAccepted && !remoteStream &&
                  (
                    <Box
                      width={"100%"}
                      height={"100%"}

                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >

                      <Text color={"white"} fontWeight={"bold"}>Your call will start once the admin starts the call</Text>
                    </Box>)
                }

                {myStream && !isAdmin &&
                  (
                    <Box
                      width={"100%"}
                      height={"100%"}

                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >

                      <Button
                        onClick={sendStreams}
                        display={callAccepted ? "none" : "block"}
                      >
                        Click here to Accept the Call
                      </Button>
                    </Box>
                  )
                }
              </>
            )}
          </Box>

          {/* bottom control section  */}
          <Box display={"flex"} flexDirection={"row"}>
            <TImeAndRoomId formatTime={formatTime} currentTime={currentTime} roomId={roomId} />

            <Box
              flex={"1"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              {callStarted || callAccepted ? (
                <>
                  <VideoControls
                    micOn={micOn}
                    cameraOn={cameraOn}
                    toggleAudio={toggleAudio}
                    toggleCamera={toggleCamera}
                    openChat={openChat}
                    setopenChat={setopenChat}
                    endCall={endCall}
                  />
                </>
              ) : (
                <></>
              )}
            </Box>

            <Box flex={"1"}>{/* leave this empty for now  */}</Box>
          </Box>
        </Box>

        {/* chat box  */}
        <ChatBox
          chats={chats}
          openChat={openChat}
          setopenChat={setopenChat}
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          handleKeyDown={handleKeyDown}
          handleSendButtonClick={handleSendButtonClick}
        />
      </Box>
    </Box>
  );
};
