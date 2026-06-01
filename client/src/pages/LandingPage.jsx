import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Flex,
  SimpleGrid,
  Icon
} from '@chakra-ui/react';
import { Shield, CheckCircle, BarChart3, ArrowRight } from 'lucide-react';


// ------------------------------
// Background SVG
// ------------------------------
const BackgroundSVG = () => (
  <Box
    as="svg"
    xmlns="http://www.w3.org/2000/svg"
    position="absolute"
    top="0"
    left="0"
    width="100%"
    height="100%"
    zIndex="0"
    preserveAspectRatio="none"
    style={{ pointerEvents: 'none' }}
  >
    <defs>
      <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style={{ stopColor: 'rgba(0, 71, 171, 0.08)' }} />
        <stop offset="100%" style={{ stopColor: 'rgba(0, 71, 171, 0)' }} />
      </radialGradient>
    </defs>

    <rect width="100%" height="100%" fill="transparent" />

    <circle cx="10%" cy="20%" r="280" fill="url(#grad1)" opacity="0.45" />
    <circle cx="85%" cy="75%" r="340" fill="url(#grad1)" opacity="0.5" />
    <circle cx="45%" cy="90%" r="260" fill="url(#grad1)" opacity="0.35" />
  </Box>
);


// ------------------------------
// Feature Card Component
// ------------------------------
const FeatureCard = ({ icon, title, children }) => (
  <VStack
    p={8}
    bg="white"
    borderRadius="xl"
    boxShadow="md"
    align="flex-start"
    spacing={4}
    borderWidth="1px"
    borderColor="gray.200"
    transition="all 0.3s"
    _hover={{ boxShadow: 'xl', transform: 'translateY(-6px)' }}
  >
    <Flex
      w="12"
      h="12"
      bg="brand.500"
      color="white"
      borderRadius="full"
      align="center"
      justify="center"
    >
      <Icon as={icon} w={6} h={6} />
    </Flex>

    <Heading size="md">{title}</Heading>
    <Text color="gray.600" fontSize="md">{children}</Text>
  </VStack>
);


// ------------------------------
// Landing Page
// ------------------------------
const LandingPage = () => {
  return (
    <Box bg="ui.background" position="relative" overflowX="hidden">
      <BackgroundSVG />

      {/* Content Wrapper */}
      <Box position="relative" zIndex="1">

        {/* Header */}
        <Box
          as="header"
          bg="rgba(255, 255, 255, 0.8)"
          backdropFilter="blur(10px)"
          shadow="sm"
          position="sticky"
          top="0"
          zIndex="10"
        >
          <Flex
            maxW="7xl"
            mx="auto"
            px={{ base: 4, lg: 8 }}
            h="20"
            align="center"
            justify="space-between"
          >
            <Heading size="lg" color="brand.600">CIT Aptitude Portal</Heading>

            <HStack spacing={{ base: 2, md: 4 }}>
              <Button
                as={Link}
                to="/login"
                variant="ghost"
                color="brand.700"
                fontWeight="600"
                _hover={{ bg: 'brand.50' }}
              >
                Login
              </Button>

              <Button
                as={Link}
                to="/register"
                colorScheme="brand"
              >
                Register
              </Button>
            </HStack>
          </Flex>
        </Box>


        {/* Hero Section */}
        <Flex align="center" justify="center" py={{ base: 24, md: 40 }} textAlign="center">
          <VStack maxW="4xl" mx="auto" spacing={6}>
            <Heading
              as="h1"
              fontSize={{ base: '4xl', md: '6xl' }}
              fontWeight="extrabold"
              lineHeight="tight"
              color="gray.800"
            >
              Sharpen Your Skills, Prepare for{" "}
              <Text as="span" color="brand.500">Success</Text>
            </Heading>

            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="gray.600"
              maxW="2xl"
            >
              The official platform for institutional aptitude assessments.
              Log in to take scheduled tests or review your performance with instant,
              detailed feedback.
            </Text>

            <HStack spacing={4} pt={4}>
              <Button
                as={Link}
                to="/login"
                colorScheme="brand"
                size="lg"
                rightIcon={<Icon as={ArrowRight} />}
              >
                Login to Portal
              </Button>

              <Button
                as={Link}
                to="/register"
                size="lg"
                bg="accent.400"
                color="white"
                _hover={{ bg: "accent.500" }}
              >
                Create Account
              </Button>
            </HStack>
          </VStack>
        </Flex>


        {/* Features Section */}
        <Box py={{ base: 20, md: 28 }} bg="rgba(255, 255, 255, 0.9)" backdropFilter="blur(6px)">
          <VStack maxW="7xl" mx="auto" px={{ base: 4, lg: 8 }} spacing={16}>
            
            <VStack maxW="2xl" mx="auto" textAlign="center" spacing={4}>
              <Text color="brand.500" fontWeight="bold">FEATURES</Text>
              <Heading size="2xl">A Platform Built for Excellence</Heading>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              <FeatureCard icon={Shield} title="Proctored Environment">
                Take tests with confidence in a secure, fullscreen-locked environment.
                Auto-submission ensures attempts are never missed.
              </FeatureCard>

              <FeatureCard icon={CheckCircle} title="Instant Feedback & Review">
                Get your score immediately and review detailed explanations for every question.
              </FeatureCard>

              <FeatureCard icon={BarChart3} title="Performance Tracking">
                Track your progress, analyze weak areas, and view historical performance trends.
              </FeatureCard>
            </SimpleGrid>

          </VStack>
        </Box>


        {/* Footer */}
        <Box as="footer" bg="gray.900" color="gray.400" py={10}>
          <Flex
            maxW="7xl"
            mx="auto"
            px={{ base: 4, lg: 8 }}
            justify="space-between"
            align="center"
          >
            <Text>© 2024 CIT Aptitude Portal. All rights reserved.</Text>
          </Flex>
        </Box>

      </Box>
    </Box>
  );
};

export default LandingPage;
