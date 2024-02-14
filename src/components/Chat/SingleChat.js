import { Box, Text } from '@chakra-ui/react'
import React from 'react'

const SingleChat = () => {
  return (
    <Box 
    display={"flex"}
    flexDirection={"column"}
    width={"100%"}
    height={"auto"}
    color={"black"}
    paddingBottom={"10px"}
    >
        <Text fontWeight={"bold"}> Adarsh </Text>
        <Text> Hey </Text>
    </Box>
  )
}

export default SingleChat