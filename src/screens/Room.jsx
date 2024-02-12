import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { Box, Button, Container } from "@chakra-ui/react";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [message, setMessage] = useState("");
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
  });

  const [openChat, setopenChat] = useState(false);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
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
  };

  const toggleAudio = () => {
    const audioTrack = myStream.getAudioTracks()[0];

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMyStream(new MediaStream([myStream.getVideoTracks()[0], audioTrack]));
    }
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
      setMessage(""); // Clear input after sending the message
    }
  };

  return (
    <Box
      display={"flex"}
      flexDirection={"row"}
      maxWidth={"1500px"}
      height={"100vh"}
      backgroundColor={"#1E1E1E"}
    >
      <Box flex={"3"}>
        <Box
          width={"100%"}
          height={"90vh"}
          display={"flex"}
          flexDirection={{base:"row",lg:"row"}}
        >
          <Box
            flex={"1"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            padding={4}
          >
            {myStream && (
              <Box
              >
                <video
                 className="video"
                  autoPlay
                  playsInline
                  muted
                  height="100%"
                  width="100%"
                  
                  ref={(videoRef) =>
                    videoRef && (videoRef.srcObject = myStream)
                  }
                />
              </Box>
            )}
          </Box>
          <Box  
            flex={"1"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            padding={4}
            >
            {remoteStream && (
              <Box>
                <video
                  className="video"
                  autoPlay
                  playsInline
                  height="100%"
                  width="100%"
                  ref={(videoRef) =>
                    videoRef && (videoRef.srcObject = remoteStream)
                  }
                />
              </Box>
            )}
          </Box>
        </Box>

        <Box>
          <Button onClick={() => setopenChat(!openChat)}>Open chat</Button>
       
          {myStream && (
            <Button onClick={sendStreams} >
              Send Stream
            </Button>
          )}
          {remoteSocketId && (
            <Button onClick={handleCallUser}>
              CALL
            </Button>
          )}
        </Box>
      </Box>
      {openChat ? <Box flex={"1"}>box2</Box> : <></>}
    </Box>
  );
};

export default RoomPage;

// <div>
// <h1>Room Page</h1>
// <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
// <input
//   type="text"
//   value={message}
//   onChange={(e) => setMessage(e.target.value)}
//   placeholder="enter message"
// />
// <button onClick={()=>alert("clicked")}>click</button>
// {myStream && <button onClick={sendStreams}  style={{ marginTop: '50px' }} >Send Stream</button>}
// {remoteSocketId && <button onClick={handleCallUser}  style={{ marginTop: '50px' }} >CALL</button>}
// {myStream && (
//   <>
//     <h1>My Stream</h1>

// <input
//   type="text"
//   value={message}
//   onChange={(e) => setMessage(e.target.value)}
// />
// <button onClick={sendMessage}>Send</button>
//     <video
//       autoPlay
//       playsInline
//       muted
//       height="300px"
//       width="200px"
//       ref={(videoRef) => videoRef && (videoRef.srcObject = myStream)}
//     />
//     <button onClick={toggleCamera}>toggle camera</button>
//     <button onClick={toggleAudio}>toggle mic</button>
//   </>
// )}
// {remoteStream && (
//   <>
//     <h1>Remote Stream</h1>
//     <video
//       autoPlay
//       playsInline
//       height="300px"
//       width="200px"
//       ref={(videoRef) => videoRef && (videoRef.srcObject = remoteStream)}
//     />

//   </>
// )}

// </div>
