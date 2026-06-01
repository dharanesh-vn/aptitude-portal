import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  Text,
  Link,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  Icon,
} from '@chakra-ui/react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import authService from '../api/authService';
import { AuthContext } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

const homeForUser = (user) => (user?.isAdmin ? '/admin' : '/dashboard');

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!formData.email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) next.email = 'Enter a valid email';
    if (!formData.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authService.login(formData.email.trim(), formData.password);
      login(response.data);
      toast.success(`Welcome back, ${response.data.name}!`);
      navigate(homeForUser(response.data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to take aptitude tests, review your scores, or manage the institution portal as an administrator."
      footer={
        <Text textAlign="center" color="gray.600" fontSize="sm">
          New student?{' '}
          <Link as={RouterLink} to="/register" color="brand.600" fontWeight="bold">
            Create an account
          </Link>
        </Text>
      }
    >
      <VStack as="form" spacing={5} align="stretch" onSubmit={handleSubmit}>
        <Box>
          <Heading size="lg" color="gray.800">
            Sign in
          </Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Use your institutional email and password.
          </Text>
        </Box>

        <FormControl isRequired isInvalid={!!errors.email}>
          <FormLabel color="gray.700">Email address</FormLabel>
          <Input
            size="lg"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@college.edu"
            value={formData.email}
            onChange={handleChange}
          />
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.password}>
          <FormLabel color="gray.700">Password</FormLabel>
          <InputGroup size="lg">
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
            <InputRightElement h="full">
              <IconButton
                variant="ghost"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                icon={<Icon as={showPassword ? EyeOff : Eye} boxSize={4} />}
                onClick={() => setShowPassword((v) => !v)}
              />
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>

        <Button type="submit" colorScheme="brand" size="lg" w="full" isLoading={isLoading} mt={2}>
          Sign in
        </Button>
      </VStack>
    </AuthLayout>
  );
};

export default Login;
