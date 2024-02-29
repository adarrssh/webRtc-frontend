import { Box, Text } from '@chakra-ui/react'
import React from 'react'

const SingleChat = ({name,message}) => {
  return (
    <Box 
    display={"flex"}
    flexDirection={"column"}
    width={"100%"}
    height={"auto"}
    color={"black"}
    paddingBottom={"10px"}
    >
        <Text fontWeight={"bold"}> {name} </Text>
        <Text> {message} </Text>
    </Box>
  )
}

export default SingleChat