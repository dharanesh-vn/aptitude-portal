import React, { useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Box, Flex, Heading, Button, Spacer } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <Box bg="ui.background" minH="100vh">
      <Flex as="nav" bg="brand.500" color="white" p={4} align="center" boxShadow="md">
        <Heading
          as={Link}
          to={user?.isAdmin ? '/admin' : '/dashboard'}
          size="md"
          _hover={{ textDecoration: 'none' }}
        >
            CIT Aptitude Portal
        </Heading>
        <Spacer />
        <Button
          as={Link}
          to="/profile"
          variant="ghost"
          color="white"
          mr={4}
          _hover={{ bg: 'whiteAlpha.200' }}
        >
            My Profile
        </Button>
        {user?.isAdmin && (
          <>
            <Button
              as={Link}
              to="/admin/analytics"
              variant="ghost"
              color="white"
              mr={2}
              _hover={{ bg: 'whiteAlpha.200' }}
            >
              Analytics
            </Button>
            <Button
              as={Link}
              to="/admin"
              variant="ghost"
              color="white"
              mr={4}
              _hover={{ bg: 'whiteAlpha.200' }}
            >
              Admin Panel
            </Button>
          </>
        )}
        {user && (
          <Button bg="accent.500" color="gray.800" _hover={{ bg: 'accent.600' }} onClick={logout}>
              Logout
          </Button> 
        )}
      </Flex>
      <Box as="main" p={{ base: 4, md: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;