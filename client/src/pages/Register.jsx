import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Button, FormControl, FormLabel, Input, Heading, VStack, Text, Link, Flex, Box } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import authService from '../api/authService';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await authService.register(formData.name, formData.email, formData.password);
            login(response.data);
            toast.success('Welcome!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed.');
        } finally { setIsLoading(false); }
    };

    return (
        <Flex minH={'calc(100vh - 80px)'} align="center" justify="center">
            <Box variant="glass" as="form" onSubmit={handleSubmit} p={12} width="full" maxW="md">
                <VStack spacing={6}>
                    <Heading size="xl" color="white" mb={4}>Create Account</Heading>

                    <FormControl isRequired>
                        <FormLabel>Full Name</FormLabel>
                        <Input size="lg" type="text" name="name" onChange={handleChange} />
                    </FormControl>
                    
                    <FormControl isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input size="lg" type="email" name="email" placeholder="your.id@cit.edu.in" onChange={handleChange} />
                    </FormControl>
                    
                    <FormControl isRequired>
                        <FormLabel>Password</FormLabel>
                        <Input size="lg" type="password" name="password" onChange={handleChange} />
                    </FormControl>
                    
                    <Button type="submit" variant="solid-light" size="lg" width="full" isLoading={isLoading} mt={4}>
                        Create Account
                    </Button>
                    
                    <Text pt={4}>
                        Already have an account?{' '}
                        <Link as={RouterLink} to="/login" color="white" fontWeight="bold">Log in</Link>
                    </Text>
                </VStack>
            </Box>
        </Flex>
    );
};

export default Register;