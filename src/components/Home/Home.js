import { Box, Button, Container, Flex, Image, Input, Text, Tooltip } from '@chakra-ui/react'
import React, { useCallback, useEffect, useState } from 'react'
import profileImage from "../../Image/Profile.png";
import HomeImage from "../../Image/HomePageImage.png";
import Video from "../../Image/VideoCamera.png";
import Keyboard from "../../Image/Keyboard.png";
import { v4 as uuid } from "uuid";
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { useSocket } from '../../context/SocketProvider';


export const Home = () => {
    const {socket,userDetails,setUserDetails} = useSocket();
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [roomId,setRoomId] = useState("")
    const uniqueRoomId = (uuid()).slice(0,8);
    const navigate = useNavigate()

    const createNewMeeting = () => {
        socket.emit("room:join",{email:userDetails.email, room : uniqueRoomId})
    }

    const joinExistingRoom = () => {
        if(roomId.length){
            socket.emit("room:join",{email:userDetails.email, room : roomId})
        }
    }

    const handleJoinRoom = useCallback(
        (data) => {
          const { email, room } = data;
          navigate(`/room/${room}`);
        },
        [navigate]
      );

    useEffect(() => {
        socket.on("room:join", handleJoinRoom);
        return () => {
          socket.off("room:join", handleJoinRoom);
        };
      }, [socket, handleJoinRoom]);


    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000); // Update every second

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, []);

    const formatDate = (date) => {
        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            // Remove seconds from formatting options
        };
        const formattedDate = date.toLocaleDateString(undefined, options);
        // Remove "at" from the formatted date
        const modifiedFormattedDate = formattedDate.replace(" at", "");

        return modifiedFormattedDate;
    };

    return (
        <Container centerContent maxWidth={"1500px"} height={"100vh"}>
            <Box
                width={"100%"}
                height={"15vh"}
                display={"flex"}
                flexDir={"row"}
                justifyContent={"space-between"}
            >
                <Box
                    paddingTop={4}
                    paddingLeft={{ base: 2, sm: 10 }}
                    color={"#54B435"}
                    fontWeight={"bold"}
                    fontSize={{ base: "1.5rem", sm: "2rem" }}
                >
                    Meet Cute
                </Box>
                <Box
                    paddingTop={4}
                    paddingRight={{ base: 3, sm: 10 }}
                    display={"flex"}
                    justifyContent={"space-between"}
                // alignItems={"center"}
                >
                    <Text
                        marginRight={"20px"}
                        paddingTop={2}
                        display={{ base: "none", lg: "block" }}
                    >{formatDate(currentDateTime)}</Text>
                    <Tooltip
                        label={(
                            <>
                                <div>John Doe</div> {/* Name */}
                                <div>Email: john.doe@example.com</div> {/* Email */}
                            </>
                        )}

                    >

                        <Image src={profileImage} borderRadius={"50%"} height={"50px"}></Image>
                    </Tooltip>
                </Box>
            </Box>

            {/* main content body */}
            <Box
                width={"100%"}
                display={"flex"}
                flexDir={"row"}
                marginTop={"10vh"}
                // backgroundColor={"red"}
                justifyContent={"center"}

            >

                {/* left box */}
                <Box

                    paddingLeft={10}
                    flex={2}
                    width={"100%"}
                    paddingRight={5}
                    // backgroundColor={"blue"}
                    display={"flex"}
                    flexDir={"column"}
                    justifyContent={"center"}
                // textAlign={"center"}
                >
                    <Box
                        textAlign={{ base: "center", lg: "left" }}
                    // backgroundColor={"yellow"}
                    >


                        <Text paddingTop={"1rem"} fontSize={{ base: "1.4rem", sm: "1.9rem" }} fontWeight={"bold"}>From boardroom meetings to virtual <br /> catch-ups, make every call count</Text>
                        <Text paddingTop={"2rem"} fontSize={{ base: "0.8rem", sm: "1.2rem" }}>Experience the ultimate in video calling conferenece <br /> with our platform</Text>
                    </Box>
                    <Box
                        display={"flex"}
                        flexDir={"row"}
                        justifyContent={{ base: "center", sm: "center", lg: "flex-start" }}
                        paddingTop={"3rem"}
                        flexDirection={{ base: "column", sm: "row" }}

                    >
                        <Button
                            padding={"1.5rem"}
                            backgroundColor={"#54B435"}
                            textAlign={{ base: "left" }}
                            color={"white"}
                            border={"1px"}
                            borderColor={"#54B435"}
                            _hover={{ backgroundColor: "none" }}
                            display={{ base: "flex" }}
                            justifyContent={{ base: "flex-start" }}
                            onClick={createNewMeeting}
                        >
                            <Image src={Video} />
                            <Text paddingLeft={"1rem"}>
                                New Meeting
                            </Text>
                        </Button>

                        <Button
                            marginLeft={{ sm: "1rem" }}
                            marginTop={{ base: "1rem", sm: "0" }}
                            padding={"1.5rem"}
                            border={"1px"}
                            borderColor={"#54B435"}
                            backgroundColor={"white"}
                            color={"black"}
                            _hover={{ backgroundColor: "none" }}
                        >
                            <Image
                                src={Keyboard}
                                color={"black"}
                            />

                            <Input

                                paddingLeft={"10px"}
                                border={"none"}
                                placeholder={'Enter a code'}
                                backgroundColor={"none"}
                                _focusVisible={{
                                    outline: "none",
                                    backgroundColor: "none"
                                }}
                                value={roomId}
                                onChange={(e)=>setRoomId(e.target.value)}
                            />


                        </Button>
                        {roomId ? <Button 
                        
                        marginLeft={"1rem"}
                        padding={"1.5rem"}
                        color={"white"}
                        backgroundColor={"#54B435"}
                        border={"1px"}
                        borderColor={"#54B435"}
                        _hover={{backgroundColor:"none"}}
                        onClick={joinExistingRoom}
                        >Join</Button> : <></>}



                    </Box>

                </Box>

                {/* right box */}
                <Box
                    display={{ base: "none", lg: "block" }}
                    paddingRight={10}
                    flex={1}>
                    <Image src={HomeImage}></Image>
                </Box>
            </Box>
            {/* <Box
            backgroundColor={"purple"}
            width={{base:"100%",sm:"100%",md:"50%",lg:"90%"}}
            >
                hey
            </Box> */}
        </Container>
    )
}
