import React from 'react'
import {Box, Container,Text, Tabs, Tab, TabList, TabPanels, TabPanel, Button } from '@chakra-ui/react'
import Login from './Login'
import Signup from './Signup'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'

const Authentication = () => {
  const navigate = useNavigate()
  return (
    <Container 
      maxW={'xl'}
      centerContent
    >
      <Button 
      position={"absolute"}
      top={"10px"}
      left={"10px"}
      backgroundColor={"#7bcc7b"}
      color={"white"}
      display={"flex"}
      justifyContent={"center"}
      _hover={{backgroundColor:"none"}}
      alignItems={"center"}
      onClick={()=> navigate("/")}
      >
        <FontAwesomeIcon icon={faArrowLeft}/>
        <Text paddingLeft={"10px"}>back</Text>
      </Button>
      <Box 
      marginTop={"10rem"}
      maxWidth={"700px"}
      width={"100%"}
       color={"black"}
        bg={"white"} 
       p={4}
        borderRadius={"lg"}
         borderWidth={"1px"}
         >
      <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em">
            <Tab  width={"50%"} color={"black"} _selected={{backgroundColor:"#7bcc7b",color:"white"}}>Login</Tab>
            <Tab width={"50%"} color={"black"} _selected={{backgroundColor:"#7bcc7b",color:"white"}} >Sign Up</Tab>
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