import { FormControl, FormLabel, VStack, Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [picLoading, setPicLoading] = useState(false);
    const toast = useToast()
    const navigate = useNavigate()

    const submitHandler = async () => {
        setPicLoading(true);
        if (!email || !password) {
          toast({
            title: "Please Fill all the Feilds",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          setPicLoading(false);
          return;
        }
    
        try {
          const config = {
            headers: {
              "Content-type": "application/json",
            },
          };
    
          const { data } = await axios.post(
            `http://localhost:8000/auth/login`,
            { email, password },
            config
          );
          
          console.log(data.user)
          toast({
            title: "Login Successful",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });

            localStorage.setItem('token', data.token);
            localStorage.setItem('email', data.user.email);
            localStorage.setItem('username', data.user.username);
          setPicLoading(false);
          navigate("/");
        } catch (error) {
          console.error(error.response.data)
          toast({
            title: "Error Occured!",
            description: `${error.response.data.error}`,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          setPicLoading(false);
        }
      };

    return (
        <VStack spacing={'5px'} color={"black"}>
            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                    placeholder="Enter You Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    focusBorderColor='#7bcc7b'

                />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input
                        type={show ? 'text' : 'password'}
                        placeholder="Enter You password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        focusBorderColor='#7bcc7b'
                    />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <Button
                width="100%"
                backgroundColor="#7bcc7b"
                color={'white'}
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={picLoading}
                _hover={{bg:'white', color:'#7bcc7b', border : '1px', borderColor:'#7bcc7b'}}
            >
                Login
            </Button>
            {/* <Button
                variant="outline"
                borderColor={"#6f4fb3"}
                color='#6f4fb3'
                width="100%"
                onClick={() => {
                    setEmail("guest@example.com");
                    setPassword("123456");
                }}
                _hover={{color:'white', bg:'#6f4fb3', border : '1px', borderColor:'#6f4fb3'}}
            >
                Sign in as a guest
            </Button> */}
        </VStack>
    )
}

export default Login