import { Box, Button, Container, Flex, Image, Input, Menu, MenuButton, MenuItem, MenuList, Text, Tooltip, useToast } from '@chakra-ui/react'
import React, { useCallback, useEffect, useState } from 'react'
import profileImage from "../../Image/Profile.png";
import HomeImage from "../../Image/HomePageImage.png";
import Video from "../../Image/VideoCamera.png";
import Keyboard from "../../Image/Keyboard.png";
import { v4 as uuid } from "uuid";
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { useSocket } from '../../context/SocketProvider';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons'



export const Home = () => {
    const { socket, userDetails, setUserDetails , isAdmin, setIsAdmin, roomId, setRoomId } = useSocket();
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const uniqueRoomId = (uuid()).slice(0, 8);
    const navigate = useNavigate()
    const toast = useToast()
    const createNewMeeting = () => {
        if (localStorage.getItem("token") && localStorage.getItem("email") && localStorage.getItem("username")) {
            setIsAdmin(true)
            setRoomId(uniqueRoomId)
            socket.emit("room:join", { email: userDetails.email, room: uniqueRoomId })
        } else {
            navigate("/login")
        }
    }

    const joinExistingRoom = () => {
        if (localStorage.getItem("token") && localStorage.getItem("email") && localStorage.getItem("username")) {
            if (roomId.length) {
                socket.emit("room:join", { email: userDetails.email, room: roomId })
            }
        } else {
            navigate("/login")

        }
    }

    const handleJoinRoom = useCallback(
        (data) => {
            const { email, room } = data;
            toast({
                title:  isAdmin ? "Call started: waiting for the other user to join":"Call Started: waiting for the user to start the call",
                status: "success",
                duration: 4000,
                isClosable: true,
                position: "bottom",
              });
            navigate(`/room/${room}`);
        },
        [navigate]
    );

    useEffect(()=>{
        if(roomId){
            setRoomId("")
        }
    },[])
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

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('username');
        navigate('/login')
    }
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
                    Meetify
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
                    {
                        localStorage.getItem("token") && localStorage.getItem("email") && localStorage.getItem("username") ?

                            <Menu>
                                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} backgroundColor={"white"}
                                    _hover={{ backgroundColor: "white" }}
                                >
                                    <Image src={profileImage} borderRadius={"50%"} height={"30px"}></Image>
                                </MenuButton>
                                <MenuList _hover={{ backgroundColor: "white" }} backgroundColor={"white"}>
                                    <MenuItem>{localStorage.getItem("email")}</MenuItem>
                                    <MenuItem onClick={logout}>Logout</MenuItem>
                                </MenuList>
                            </Menu>
                            :
                            <Image src={profileImage} borderRadius={"50%"} height={"50px"}></Image>

                    }
                </Box>
            </Box>

            {/* main content body */}
            <Box
                width={"100%"}
                display={"flex"}
                flexDir={"row"}
                marginTop={"10vh"}
                justifyContent={"center"}

            >

                {/* left box */}
                <Box

                    paddingLeft={10}
                    flex={2}
                    width={"100%"}
                    paddingRight={5}
                    display={"flex"}
                    flexDir={"column"}
                    justifyContent={"center"}
                >
                    <Box
                        textAlign={{ base: "center", lg: "left" }}
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
                            minWidth={"fit-content"}
                        >
                            <Image display={{ base: "none", md: "block" }} src={Video} />
                            <Text paddingLeft={"1rem"} paddingRight={"1rem"}
                            >
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
                            _hover={{ backgroundColor: "white" }}
                            _o
                        >
                            <Image
                                src={Keyboard}
                                color={"black"}
                                display={{ base: "none", md: "block" }}
                            />

                            <Input
                                width={"100%"}
                                paddingLeft={"10px"}
                                border={"none"}
                                placeholder={'Enter a meeting code'}
                                backgroundColor={"none"}
                                _focusVisible={{
                                    outline: "none",
                                    backgroundColor: "white"
                                }}
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                            />


                        </Button>
                        {roomId ? <Button

                            marginLeft={"1rem"}
                            padding={"1.5rem"}
                            color={"white"}
                            backgroundColor={"#54B435"}
                            border={"1px"}
                            borderColor={"#54B435"}
                            _hover={{ backgroundColor: "none" }}
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
        </Container>
    )
}
