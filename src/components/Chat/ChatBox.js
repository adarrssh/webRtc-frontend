import React, { useEffect, useRef } from "react";

  import {
    Box,
    Button,
    Input,
    Text,
  } from "@chakra-ui/react";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import {
    faXmark,
    faPaperPlane,
  } from "@fortawesome/free-solid-svg-icons";
  import SingleChat from "../Chat/SingleChat";

  
const ChatBox = ({openChat,setopenChat,chats, setMessage, sendMessage,message}) => {

  const messageEl = useRef(null);

  useEffect(() => {
    if (messageEl) {
      messageEl.current.addEventListener("DOMNodeInserted", (event) => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight });
      });
    }
  }, []);


  return (
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
  )
}

export default ChatBox