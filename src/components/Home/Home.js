import { Box, Button, Container, Flex, Image, Input, Text } from '@chakra-ui/react'
import React from 'react'
import profileImage from "../../Image/Profile.png";
import HomeImage from "../../Image/HomePageImage.png";
import Video from "../../Image/VideoCamera.png";
import Keyboard from "../../Image/Keyboard.png";


export const Home = () => {
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
                    paddingLeft={10}
                    color={"#54B435"}
                    fontWeight={"bold"}
                    fontSize={"2rem"}
                >
                    Meet Cute
                </Box>
                <Box
                    paddingTop={4}
                    paddingRight={10}
                >
                    <Image src={profileImage}></Image>
                </Box>
            </Box>

            <Box
                width={"100%"}
                height={"3rem"}
                display={"flex"}
                flexDir={"row"}
                justifyContent={"space-between"}

                // backgroundColor={"red"}
                marginTop={"5vh"}
            >
                <Box

                    paddingLeft={10}
                    flex={2}
                    paddingRight={5}
                    m={{ base: 0, sm: 4 }} p={{ base: 0, sm: 4 }}
                >

                    <Text paddingTop={"1rem"} fontSize={"1.9rem"} fontWeight={"bold"}>From boardroom meetings to virtual <br /> catch-ups, make every call count</Text>
                    <Text paddingTop={"2rem"} fontSize={"1.2rem"}>Experience the ultimate in video calling conferenece <br /> with our platform</Text>

                    <Box
                        display={"flex"}
                        flexDir={"row"}
                        justifyContent={"flex-start"}
                        paddingTop={"1rem"}
                        flexDirection={{ base: "column", sm: "row" }}

                    >
                        <Button
                            padding={"1.5rem"}
                            backgroundColor={"#54B435"}
                            color={"white"}
                            border={"1px"}
                            borderColor={"#54B435"}
                            _hover={{backgroundColor:"none"}}
                        >
                            <Image src={Video} />
                            <Text paddingLeft={"1rem"}>
                                New Meeting
                            </Text>
                        </Button>

                        <Button
                            marginLeft={"1rem"}
                            padding={"1.5rem"}
                            border={"1px"}
                            borderColor={"#54B435"}
                            backgroundColor={"white"}
                            color={"black"}
                            _hover={{backgroundColor:"none"}}
                        >
                            <Image 
                            src={Keyboard}
                            color={"black"}
                            ></Image>

                            <Input
                         
                            paddingLeft={"10px"}
                            border={"none"}
                            placeholder={'Enter a code'}
                            backgroundColor={"none"}
                            _focusVisible={{
                                outline: "none",
                                backgroundColor:"none"
                           }}
                            />
                            
                           
                        </Button>

                        <Button 
                        
                        marginLeft={"1rem"}
                        padding={"1.5rem"}
                        color={"white"}
                        backgroundColor={"#54B435"}
                        border={"1px"}
                        borderColor={"#54B435"}
                        _hover={{backgroundColor:"none"}}
                        
                        >Join</Button>

                    </Box>

                </Box>
                <Box
                    display={{ base: "none", md: "block" }}
                    paddingRight={10}
                    flex={1}>
                    <Image src={HomeImage}></Image>
                </Box>
            </Box>
        </Container>
    )
}
