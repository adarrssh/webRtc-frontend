import React, {
  useEffect,
  useCallback,
  useState,
  useMemo,
  useRef,
} from "react";
import ReactPlayer from "react-player";
import peer from "../../service/peer";
import { useSocket } from "../../context/SocketProvider";
import {
  Box,
  Button,
  Container,
  Image,
  Input,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
  faCamera,
  faComment,
  faPhoneSlash,
  faCameraAlt,
  faXmark,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { formatTime } from "../../util/FormatTime";
import { ReactComponent as Icon } from "../../Image/cameraoff.svg";
import SingleChat from "../Chat/SingleChat";

export const RoomPage = () => {
  const { socket } = useSocket();
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
  const [isAdmin, setIsAdmin] = useState(false);
  const messageEl = useRef(null);

  useEffect(() => {
    if (messageEl) {
      messageEl.current.addEventListener("DOMNodeInserted", (event) => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight });
      });
    }
  }, []);

  const handleUserJoined = useCallback(({ email, id }) => {
    setIsAdmin(true);
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
    setChats([...chats, { name: userDetails.name, message }]);
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
    if (event.key === "Enter") {
      if (socket) {
        setChats([...chats, { name: userDetails.name, message }]);
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
    console.log(chats);
  }, [chats]);
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
                backgroundColor={micOn ? "#2e2e2e" : "#FF5449"}
                // padding={"15px"}
                height={"50px"}
                width={"50px"}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                onClick={toggleAudio}
                _hover={{
                  cursor: "pointer",
                }}
              >
                {micOn ? (
                  <FontAwesomeIcon icon={faMicrophone} color="white" />
                ) : (
                  <FontAwesomeIcon icon={faMicrophoneSlash} color="white" />
                )}
              </Box>

              <Box
                borderRadius={"50%"}
                backgroundColor={cameraOn ? "#2e2e2e" : "#FF5449"}
                height={"50px"}
                width={"50px"}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                marginLeft={"10px"}
                onClick={toggleCamera}
                _hover={{
                  cursor: "pointer",
                }}
              >
                {cameraOn ? (
                  <FontAwesomeIcon icon={faCamera} color="white" />
                ) : (
                  <Icon />
                )}
              </Box>

              <Box
                borderRadius={"50%"}
                backgroundColor={openChat ? "white" : "#2e2e2e"}
                height={"50px"}
                width={"50px"}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                marginLeft={"10px"}
                _hover={{
                  cursor: "pointer",
                }}
                onClick={() => setopenChat(!openChat)}
              >
                <FontAwesomeIcon
                  icon={faComment}
                  color={openChat ? "black" : "white"}
                />
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
                  cursor: "pointer",
                }}
              >
                <FontAwesomeIcon icon={faPhoneSlash} color="white" />
              </Box>
            </Box>

            <Box flex={"1"}>
              {myStream && !isAdmin && (
                <Button
                  onClick={sendStreams}
                  display={callAccepted ? "none" : "block"}
                >
                  Send Stream
                </Button>
              )}
              {remoteSocketId && isAdmin && (
                <Button
                  onClick={handleCallUser}
                  display={callStarted ? "none" : "block"}
                >
                  CALL
                </Button>
              )}
            </Box>
          </Box>
        </Box>
        <Box
          backgroundColor={"#121212"}
          width={
            openChat ? { base: "90%", sm: "60%", md: "40%", lg: "30%" } : "0"
          }
          transition="width 0.3s ease, transform 0.3s ease"
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Box
            display={"flex"}
            flexDirection={"column"}
            backgroundColor={"white"}
            height={"80%"}
            width={"80%"}
            borderRadius={"1rem"}
          >
            <Box
              width={"100%"}
              height={"10%"}
              borderTopRadius={"1rem"}
              display={"flex"}
              flexDir={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Text paddingLeft={4}>In call Messages</Text>
              <Button
                onClick={() => setopenChat(false)}
                paddingRight={4}
                backgroundColor={"white"}
                _hover={{
                  backgroundColor: "white",
                }}
              >
                <FontAwesomeIcon icon={faXmark} />
              </Button>
            </Box>
            <Box
              ref={messageEl}
              width={"100%"}
              height={"80%"}
              padding={4}
              overflowY={"auto"}
              sx={{
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {chats.map((chat, key) => (
                <>
                  <SingleChat
                    key={key}
                    name={chat.name}
                    message={chat.message}
                  />
                </>
              ))}
            </Box>
            <Box
              width={"100%"}
              height={"10%"}
              borderBottomRadius={"1rem"}
              display={"flex"}
              flexDirection={"row"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Box
                backgroundColor={"#ececec"}
                borderRadius={"1rem"}
                width={"95%"}
                height={"60%"}
                display={"flex"}
                flexDirection={"row"}
                alignItems={"center"}
              >
                <Input
                  border={"0px"}
                  placeholder="send message"
                  borderStartRadius={"1rem"}
                  borderEndRadius={"1rem"}
                  width={"90%"}
                  height={"100%"}
                  focusBorderColor="transparent"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={sendMessage}
                />
                <Button
                  height={"100%"}
                  borderEndRadius={"1rem"}
                  backgroundColor={"#ececec"}
                  _hover={{
                    backgroundColor: "#ececec",
                  }}
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
