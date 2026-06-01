import React, { useState, useContext, useMemo } from 'react';
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
  Progress,
  FormHelperText,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  Icon,
  Checkbox,
} from '@chakra-ui/react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import authService from '../api/authService';
import { AuthContext } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const score = useMemo(() => strengthScore(formData.password), [formData.password]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = 'Full name is required';
    if (!formData.email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) next.email = 'Enter a valid email';
    if (formData.password.length < 8) next.password = 'At least 8 characters required';
    if (formData.password !== formData.confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }
    if (!acceptedTerms) next.terms = 'Please accept the terms to continue';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      if (!acceptedTerms) toast.error('Please accept the terms to register.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password
      );
      login(response.data);
      toast.success('Account created successfully!');
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
    <AuthLayout
      title="Join the portal"
      subtitle="Create a student account to access scheduled aptitude tests, track your progress, and download performance reports."
      footer={
        <Text textAlign="center" color="gray.600" fontSize="sm">
          Already registered?{' '}
          <Link as={RouterLink} to="/login" color="brand.600" fontWeight="bold">
            Sign in
          </Link>
        </Text>
      }
    >
      <VStack as="form" spacing={5} align="stretch" onSubmit={handleSubmit}>
        <Box>
          <Heading size="lg" color="gray.800">
            Create account
          </Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Students only — admin accounts are assigned by the super administrator.
          </Text>
        </Box>

        <FormControl isRequired isInvalid={!!errors.name}>
          <FormLabel color="gray.700">Full name</FormLabel>
          <Input
            size="lg"
            name="name"
            placeholder="Your full name"
            value={formData.name}
            onChange={handleChange}
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.email}>
          <FormLabel color="gray.700">Email address</FormLabel>
          <Input
            size="lg"
            type="email"
            name="email"
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
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
            />
            <InputRightElement h="full">
              <IconButton
                variant="ghost"
                aria-label="Toggle password"
                icon={<Icon as={showPassword ? EyeOff : Eye} boxSize={4} />}
                onClick={() => setShowPassword((v) => !v)}
              />
            </InputRightElement>
          </InputGroup>
          <FormHelperText color="gray.500">
            Use upper & lower case, numbers, and symbols for a stronger password.
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
              <Text fontSize="sm" mt={1} color="gray.600">
                Strength: {strengthLabel(score)}
              </Text>
            </>
          )}
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.confirmPassword}>
          <FormLabel color="gray.700">Confirm password</FormLabel>
          <Input
            size="lg"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.terms}>
          <Checkbox
            isChecked={acceptedTerms}
            onChange={(e) => {
              setAcceptedTerms(e.target.checked);
              setErrors((prev) => ({ ...prev, terms: '' }));
            }}
            colorScheme="brand"
          >
            <Text fontSize="sm" color="gray.600">
              I agree to follow proctored test rules (fullscreen, no tab switching).
            </Text>
          </Checkbox>
          <FormErrorMessage>{errors.terms}</FormErrorMessage>
        </FormControl>

        <Button type="submit" colorScheme="brand" size="lg" w="full" isLoading={isLoading}>
          Create account
        </Button>
      </VStack>
    </AuthLayout>
  );
};

export default Register;
