import React from 'react'
import {Box, Container,Text, Tabs, Tab, TabList, TabPanels, TabPanel } from '@chakra-ui/react'
import Login from './Login'
import Signup from './Signup'

const Authentication = () => {
  return (
    <Container 
      maxW={'xl'}
      centerContent
    >
      <Box 
      marginTop={"10rem"}
      maxWidth={"700px"}
      width={"100%"}
       backgroundColor={"blue"} 
       color={"black"} bg={"white"} 
       p={4}
        borderRadius={"lg"}
         borderWidth={"1px"}
         >
      <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em">
            <Tab  width={"50%"} color={"black"}>Login</Tab>
            <Tab width={"50%"} color={"black"} >Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup/>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
}

export default Authentication