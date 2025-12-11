import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Box, Heading, Text, Button, VStack, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // The 'result' object we get from the Test page is the newly created submission document
  const { result } = location.state || {};

  // If the user navigates to this page directly without a result, show a fallback message
  if (!result || !result._id) {
    return (
        <Box textAlign="center" py={10} px={6}>
            <Heading as="h2" size="xl" mt={6} mb={2}>No Result Found</Heading>
            <Text color={'gray.500'}>Test results are shown here after completing a test.</Text>
            <Button colorScheme="brand" mt={6} onClick={() => navigate('/dashboard')}>
                Back to Dashboard
            </Button>
      </Box>
    );
  }

  const percentage = result.total > 0 ? ((result.score / result.total) * 100).toFixed(2) : 0;

  return (
    <VStack spacing={8} align="center" justify="center" minH="70vh">
      <Heading size="2xl">Test Completed!</Heading>
      <Box p={8} shadow="xl" borderWidth="1px" borderRadius="lg" w="full" maxW="md" textAlign="center">
        <Stat>
          <StatLabel fontSize="lg">Your Score</StatLabel>
          <StatNumber fontSize="6xl" color="brand.500">{result.score} / {result.total}</StatNumber>
          <StatHelpText fontSize="2xl">{percentage}%</StatHelpText>
        </Stat>
      </Box>
      <VStack spacing={4}>
        {/*
          THE FIX IS HERE: We link to `/review/` followed by the submission's ID (`result._id`).
          The URL now matches the route we defined in App.jsx: <Route path="review/:submissionId" ... />
        */}
        <Button as={Link} to={`/review/${result._id}`} colorScheme="green" size="lg">
            Review Answers
        </Button>
        <Button onClick={() => navigate('/dashboard')} size="lg" variant="outline">
            Back to Dashboard
        </Button>
      </VStack>
    </VStack>
  );
};

export default Results;