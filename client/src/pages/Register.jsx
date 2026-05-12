import React, { useState, useContext, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  Text,
  Link,
  Flex,
  Box,
  Progress,
  FormHelperText,
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import authService from '../api/authService';
import { AuthContext } from '../context/AuthContext';

const strengthScore = (password) => {
  let s = 0;
  if (password.length >= 8) s += 1;
  if (password.length >= 12) s += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s += 1;
  if (/\d/.test(password)) s += 1;
  if (/[^A-Za-z0-9]/.test(password)) s += 1;
  return Math.min(s, 4);
};

const strengthLabel = (s) => {
  if (s <= 1) return 'Weak';
  if (s === 2) return 'Fair';
  if (s === 3) return 'Good';
  return 'Strong';
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const score = useMemo(() => strengthScore(formData.password), [formData.password]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register(formData.name, formData.email, formData.password);
      login(response.data);
      toast.success('Welcome!');
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Registration failed.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const strengthPct = (score / 4) * 100;
  const strengthColor =
    score <= 1 ? 'red' : score === 2 ? 'orange' : score === 3 ? 'yellow' : 'green';

  return (
    <Flex minH={'calc(100vh - 80px)'} align="center" justify="center">
      <Box variant="glass" as="form" onSubmit={handleSubmit} p={12} width="full" maxW="md">
        <VStack spacing={6}>
          <Heading size="xl" color="white" mb={4}>
            Create Account
          </Heading>

          <FormControl isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input size="lg" type="text" name="name" onChange={handleChange} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              size="lg"
              type="email"
              name="email"
              placeholder="your.id@cit.edu.in"
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input size="lg" type="password" name="password" onChange={handleChange} />
            <FormHelperText color="gray.300">
              Minimum 8 characters. Mix upper, lower, numbers, and symbols for a stronger password.
            </FormHelperText>
            {formData.password && (
              <>
                <Progress
                  value={strengthPct}
                  size="sm"
                  colorScheme={strengthColor}
                  borderRadius="md"
                  mt={2}
                />
                <Text fontSize="sm" mt={1} color="gray.200">
                  Strength: {strengthLabel(score)}
                </Text>
              </>
            )}
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Confirm password</FormLabel>
            <Input size="lg" type="password" name="confirmPassword" onChange={handleChange} />
          </FormControl>

          <Button
            type="submit"
            variant="solid-light"
            size="lg"
            width="full"
            isLoading={isLoading}
            mt={4}
          >
            Create Account
          </Button>

          <Text pt={4}>
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="white" fontWeight="bold">
              Log in
            </Link>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default Register;
