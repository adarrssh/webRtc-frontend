import { FormControl, FormLabel, VStack, Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Signup = () => {
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);

    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const toast = useToast()
    const navigate = useNavigate()

    const submitHandler = async () => {
        if (!name || !email || !password) {
            toast({
                title: "Please Fill all the Feilds",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            };
            const { data } = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/auth/signup`,
                {
                    name,
                    email,
                    password
                },
                config
            );

            localStorage.setItem('token', data.token);
            localStorage.setItem('email', data.email);
            localStorage.setItem('username', data.username);

            toast({
                title: "Registration Successful",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            navigate('/')
        } catch (error) {
            console.error(error)
            toast({
                title: "Error Occured!",
                description: `${error.response.data.error}`,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };

    return (
        <VStack spacing={'5px'} color={"black"}>
            <FormControl id='first-name' isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                    placeholder="Enter You Name"
                    onChange={(e) => setName(e.target.value)}
                    focusBorderColor='#7bcc7b'

                />
            </FormControl>
            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                    placeholder="Enter You Email"
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
                backgroundColor="#7bcc7b"
                color={'white'}
                width="100%"
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                _hover={{bg:'white', color:'#7bcc7b', border : '1px', borderColor:'#7bcc7b'}}

            >
                Sign Up
            </Button>
        </VStack>
    )
}

export default Signup