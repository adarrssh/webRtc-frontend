import React from 'react'
import { Box } from '@chakra-ui/react'
import { faCamera, faComment, faMicrophone, faMicrophoneSlash, faPhoneSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactComponent as Icon } from "../../Image/cameraoff.svg";

const VideoControls = ({micOn,cameraOn,toggleAudio,toggleCamera,openChat,setopenChat}) => {
    return (
        <>

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
        </>
    )
}

export default VideoControls