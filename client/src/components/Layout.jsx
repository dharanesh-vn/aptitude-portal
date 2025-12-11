import React, { useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Box, Flex, Heading, Button, Spacer, HStack } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';

const NavbarHeight = "80px";

const Layout = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <Box>
      {/* 
        THE NAVBAR IS NOW TRANSPARENT. It will appear to "float" over the homepage 
        and have a solid background on other pages. This is controlled by the `bg`
        prop on the pages themselves.
      */}
      <Flex
        as="nav"
        position="absolute" // Changed to absolute to float over content
        top="0"
        left="0"
        right="0"
        zIndex="docked"
        px={8}
        py={4}
        align="center"
        h={NavbarHeight}
      >
        <Heading as={Link} to="/" size="md" color="white" _hover={{ color: 'gray.200' }}>
            Aptitude Portal
        </Heading>
        <Spacer />
        
        {user ? (
          <HStack spacing={4}>
            <Button as={Link} to="/dashboard" variant="link" color="gray.300" _hover={{ color: 'white' }}>Dashboard</Button>
            <Button as={Link} to="/profile" variant="link" color="gray.300" _hover={{ color: 'white' }}>My Profile</Button>
            {user.isAdmin && <Button as={Link} to="/admin" variant="link" color="gray.300" _hover={{ color: 'white' }}>Admin Panel</Button>}
            <Button colorScheme="red" size="sm" onClick={logout}>Logout</Button>
          </HStack>
        ) : (
          <HStack spacing={4}>
            <Button as={Link} to="/login" variant="link" color="gray.300" _hover={{ color: 'white' }}>Login</Button>
            <Button as={Link} to="/register" variant="solid-light" size="sm">Create Account</Button>
          </HStack>
        )}
      </Flex>
      
      <Box as="main">
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;