import React, { useEffect, useCallback, useState, useMemo } from "react";
import peer from "../../service/peer";
import { useSocket } from "../../context/SocketProvider";
import { Box, Button, Text } from "@chakra-ui/react";
import { formatTime } from "../../util/FormatTime";
import ChatBox from "../Chat/ChatBox";
import VideoControls from "../Controls/VideoControls";
import TImeAndRoomId from "../Controls/TImeAndRoomId";

export const RoomPage = () => {
  const { socket, isAdmin } = useSocket();
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
  const [cameraOn, setCameraOn] = useState(true);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
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

    setCameraOn(!cameraOn);
  };

  const toggleAudio = () => {
    const audioTrack = myStream.getAudioTracks()[0];

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMyStream(new MediaStream([myStream.getVideoTracks()[0], audioTrack]));
    }
    setMicOn(!micOn);
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
    handleIncomingMessage,
  ]);

  const sendMessage = (event) => {
    if (event.key === "Enter" && message.length > 0) {
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newTime = new Date();
      if (newTime.getTime() !== currentTime.getTime()) {
        setCurrentTime(newTime);
      }
    }, 1000);

    return () => clearInterval(intervalId);
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

  // useEffect(()=>{
  //   console.log({isAdmin,remoteSocketId,callStarted})
  //   console.log(isAdmin && (remoteSocketId === null) && !callStarted)
  // })
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
        maxWidth={"1500px"}
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
            height={"90vh"}
            display={"flex"}
            flexDirection={"row"}
          >
            {(isAdmin && callStarted) || (!isAdmin && callAccepted) ? (
              <>
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
              </>
            ) : (
              <>

                {isAdmin && (remoteSocketId === null) && !callStarted &&
                  (
                    <Box
                     width={"100%"}
                     display={"flex"}
                     justifyContent={"center"}
                     alignItems={"center"}
                    >

                    <Text color={"white"}  fontWeight={"bold"} >Please wait while the other user joins....</Text>
                    </Box>
                  )
                }

                {isAdmin && remoteSocketId && !callStarted &&
                  (
                    <Box
                    width={"100%"}
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
                     display={"flex"}
                     justifyContent={"center"}
                     alignItems={"center"}
                    >

                    <Text color={"white"} fontWeight={"bold"}>Your call will start once the admin starts the call</Text>
                    </Box>                  )
                }

                {myStream && !isAdmin &&
                  (
                    <Box
                    width={"100%"}
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
            <TImeAndRoomId formatTime={formatTime} currentTime={currentTime} />

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
        />
      </Box>
    </Box>
  );
};