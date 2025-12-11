import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Flex, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';

// Define the correct path to your background image in the public folder
const heroImageUrl = '/images/hero-background.png';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    // The main container is now the full viewport height to position content perfectly
    <Flex
      w={'full'}
      h={'100vh'} // Takes up the entire screen height
      backgroundImage={`url(${heroImageUrl})`}
      backgroundSize={'cover'}
      backgroundPosition={'center center'}
      align={'center'}
      justify={'center'}
      pt={"80px"} // Push content down to account for the floating navbar
    >
      {/* 
        This VStack is the "frosted glass" card. 
        It is now the component that has the glass effect applied.
      */}
      <VStack
        spacing={6}
        p={{ base: 8, md: 12 }}
        textAlign="center"
        maxW="2xl" // Set a max-width for the content
        
        // --- THIS IS THE CONTAINED GLASS EFFECT ---
        bg="rgba(10, 10, 15, 0.4)" // Slightly darker glass for better contrast
        backdropFilter="blur(20px) saturate(180%)"
        borderRadius="3xl"
        border="1px solid rgba(255, 255, 255, 0.1)"
        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)" // A more pronounced shadow
      >
        <Heading 
            as="h1" 
            fontSize={{ base: '4xl', md: '6xl' }} // <-- INCREASED FONT SIZE
            fontWeight="bold" 
            color="white"
        >
          Unlock Your Potential
        </Heading>

        <Text 
            fontSize={{ base: 'lg', md: 'xl' }} 
            color={'gray.200'} 
            maxW="xl"
        >
          Dive into expertly crafted aptitude tests, where innovative challenges meet professional expertise.
        </Text>
        
        <Button
            as={Link}
            to={user ? '/dashboard' : '/register'}
            variant="solid-light"
            size={'lg'}
            px={12} // Increased padding for a larger button
            mt={6}
        >
            {user ? 'Go to Dashboard' : 'Discover Now'}
        </Button>
      </VStack>
    </Flex>
  );
};

export default Home;