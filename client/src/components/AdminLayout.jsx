import React, { useContext } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Button,
  VStack,
  Text,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Tests', path: '/admin/tests' },
  { label: 'Questions', path: '/admin/questions' },
  { label: 'Analytics', path: '/admin/analytics' },
  { label: 'Test results', path: '/admin/results' },
  { label: 'Users', path: '/admin/users' },
];

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <Flex minH="100vh" bg="ui.background">
      <Box
        as="aside"
        w={{ base: 'full', md: '260px' }}
        bg="brand.800"
        color="white"
        display={{ base: 'none', md: 'block' }}
        flexShrink={0}
      >
        <Box p={6}>
          <Heading size="md">Admin Console</Heading>
          <Badge mt={2} colorScheme="yellow" color="gray.900">
            Super admin
          </Badge>
        </Box>
        <Divider borderColor="whiteAlpha.300" />
        <VStack align="stretch" spacing={1} p={4}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              as={Link}
              to={item.path}
              justifyContent="flex-start"
              variant={isActive(item.path) ? 'solid' : 'ghost'}
              bg={isActive(item.path) ? 'brand.600' : 'transparent'}
              color="white"
              _hover={{ bg: isActive(item.path) ? 'brand.600' : 'whiteAlpha.200' }}
              fontWeight={isActive(item.path) ? '700' : '500'}
            >
              {item.label}
            </Button>
          ))}
        </VStack>
        <Box p={4} mt="auto">
          <Button
            as={Link}
            to="/dashboard"
            variant="outline"
            colorScheme="whiteAlpha"
            size="sm"
            w="full"
            mb={2}
          >
            Student view
          </Button>
          <Text fontSize="xs" color="whiteAlpha.700" mb={2} noOfLines={1}>
            {user?.email}
          </Text>
          <Button
            w="full"
            bg="accent.500"
            color="gray.900"
            _hover={{ bg: 'accent.400' }}
            onClick={logout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Box flex={1} minW={0}>
        <Flex
          as="header"
          bg="white"
          borderBottomWidth="1px"
          borderColor="gray.200"
          px={{ base: 4, md: 8 }}
          py={4}
          align="center"
          justify="space-between"
          display={{ base: 'flex', md: 'none' }}
          flexWrap="wrap"
          gap={2}
        >
          <Heading size="sm" color="brand.700">
            Admin
          </Heading>
          <Flex gap={2} flexWrap="wrap">
            {navItems.slice(0, 4).map((item) => (
              <Button
                key={item.path}
                as={Link}
                to={item.path}
                size="xs"
                colorScheme={isActive(item.path) ? 'brand' : 'gray'}
                variant={isActive(item.path) ? 'solid' : 'outline'}
              >
                {item.label}
              </Button>
            ))}
          </Flex>
        </Flex>

        <Box as="main" p={{ base: 4, md: 8 }}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default AdminLayout;
