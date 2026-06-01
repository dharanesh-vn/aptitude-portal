import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Link,
} from '@chakra-ui/react';
import { Shield, BarChart3, CheckCircle } from 'lucide-react';

const highlights = [
  { icon: Shield, text: 'Secure proctored assessments' },
  { icon: BarChart3, text: 'Instant scores and analytics' },
  { icon: CheckCircle, text: 'Detailed answer review' },
];

/**
 * Split auth shell: brand panel + form card (market-style login/register).
 */
const AuthLayout = ({ title, subtitle, children, footer }) => (
  <Flex minH="100vh" direction={{ base: 'column', lg: 'row' }}>
    <Box
      flex={{ lg: 1 }}
      bgGradient="linear(to-br, brand.700, brand.500)"
      color="white"
      px={{ base: 8, lg: 16 }}
      py={{ base: 10, lg: 16 }}
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
        <Heading size="lg" letterSpacing="tight">
          CIT Aptitude Portal
        </Heading>
      </Link>
      <Heading mt={10} size="2xl" fontWeight="bold" lineHeight="shorter">
        {title}
      </Heading>
      <Text mt={4} fontSize="lg" color="whiteAlpha.900" maxW="md">
        {subtitle}
      </Text>
      <VStack align="stretch" spacing={4} mt={10} display={{ base: 'none', md: 'flex' }}>
        {highlights.map(({ icon: Ico, text }) => (
          <HStack key={text} spacing={3}>
            <Flex
              w={10}
              h={10}
              borderRadius="lg"
              bg="whiteAlpha.200"
              align="center"
              justify="center"
            >
              <Icon as={Ico} boxSize={5} />
            </Flex>
            <Text fontWeight="500">{text}</Text>
          </HStack>
        ))}
      </VStack>
    </Box>

    <Flex
      flex={{ lg: 1 }}
      bg="ui.background"
      align="center"
      justify="center"
      px={{ base: 6, lg: 12 }}
      py={12}
    >
      <Box
        w="full"
        maxW="md"
        bg="white"
        p={{ base: 8, md: 10 }}
        borderRadius="2xl"
        boxShadow="xl"
        borderWidth="1px"
        borderColor="gray.200"
      >
        {children}
        {footer && (
          <Box mt={8} pt={6} borderTopWidth="1px" borderColor="gray.100">
            {footer}
          </Box>
        )}
      </Box>
    </Flex>
  </Flex>
);

export default AuthLayout;
