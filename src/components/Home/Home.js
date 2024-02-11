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
                    paddingLeft={{base:2,sm:10}}
                    color={"#54B435"}
                    fontWeight={"bold"}
                    fontSize={{ base:"1.5rem",sm:"2rem"}}
                >
                    Meet Cute
                </Box>
                <Box
                    paddingTop={4}
                    paddingRight={{base:3,sm:10}}
                >
                    <Image src={profileImage}></Image>
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
                    textAlign={{base:"center",lg:"left"}}
                    // backgroundColor={"yellow"}
                    >


                    <Text paddingTop={"1rem"} fontSize={{base:"1.4rem",sm:"1.9rem"}} fontWeight={"bold"}>From boardroom meetings to virtual <br /> catch-ups, make every call count</Text>
                    <Text paddingTop={"2rem"} fontSize={{base:"0.8rem",sm:"1.2rem"}}>Experience the ultimate in video calling conferenece <br /> with our platform</Text>
                    </Box>
                    <Box
                        display={"flex"}
                        flexDir={"row"}
                        justifyContent={{base:"center",sm:"center",lg:"flex-start"}}
                        paddingTop={"3rem"}
                        flexDirection={{ base:"column", sm: "row" }}

                    >
                        <Button
                            padding={"1.5rem"}
                            backgroundColor={"#54B435"}
                            textAlign={{base:"left"}}
                            color={"white"}
                            border={"1px"}
                            borderColor={"#54B435"}
                            _hover={{backgroundColor:"none"}}
                            display={{base:"flex"}}
                            justifyContent={{base:"flex-start"}}
                        >
                            <Image src={Video} />
                            <Text paddingLeft={"1rem"}>
                                New Meeting
                            </Text>
                        </Button>

                        <Button
                            marginLeft={{sm:"1rem"}}
                            marginTop={{base:"1rem",sm:"0"}}
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
                            />

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

                        {/* <Button 
                        
                        marginLeft={"1rem"}
                        padding={"1.5rem"}
                        color={"white"}
                        backgroundColor={"#54B435"}
                        border={"1px"}
                        borderColor={"#54B435"}
                        _hover={{backgroundColor:"none"}}
                        
                        >Join</Button> */}

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
