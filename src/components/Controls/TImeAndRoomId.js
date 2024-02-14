import { Box, Text } from '@chakra-ui/react'
import React from 'react'

const TImeAndRoomId = ({formatTime,currentTime}) => {
  return (
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
  )
}

export default TImeAndRoomId