import React, { useContext, useState, useEffect, useRef } from 'react';
// useNavigate is no longer needed, so it has been removed
import {
  Box, Heading, Text, Button, VStack, useDisclosure, AlertDialog, AlertDialogBody,
  AlertDialogFooter, AlertDialogHeader, AlertDialogContent, Spinner, Flex
} from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import testService from '../api/testService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // It IS used, re-adding it.

const TestCard = ({ test, onStart }) => (
  <Box variant="glass" p={6} width="full">
    <VStack align="stretch" spacing={4}>
      <Heading size="md" color="white">{test.title}</Heading>
      <Text color="gray.300">Duration: {test.duration} minutes</Text>
      <Text fontWeight="bold" color="red.300">
        IMPORTANT: This test is proctored. Exiting will automatically submit your attempt.
      </Text>
      <Button variant="solid-light" onClick={() => onStart(test)} size="lg" mt={2}>
        Start Test
      </Button>
    </VStack>
  </Box>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // Re-added because it's used
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null); // This is used
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    testService.getAllTests()
      .then(res => setTests(res.data))
      .catch(() => toast.error('Could not fetch available tests.'))
      .finally(() => setLoading(false));
  }, []);

  const handleStartClick = (test) => {
    setSelectedTest(test);
    onOpen();
  };
  
  const handleConfirmStart = () => { // This is used
    onClose();
    if (selectedTest) {
      navigate(`/test/${selectedTest._id}`);
    }
  };

  return (
    <>
      <VStack spacing={8} align="stretch" p={{ base: 4, md: 8 }}>
        <Heading as="h1" size="xl" color="white">Welcome, {user?.name}</Heading>
        {loading ? (
          <Flex justify="center" align="center" h="40vh"><Spinner size="xl" color="white" /></Flex>
        ) : tests.length > 0 ? (
          <VStack spacing={6} align="stretch">
            {tests.map(test => <TestCard key={test._id} test={test} onStart={handleStartClick} />)}
          </VStack>
        ) : (
          <Box variant="glass" p={10} textAlign="center">
            <Heading size="md" color="white">No tests are available at the moment.</Heading>
            <Text mt={2} color="gray.300">Please check back later.</Text>
          </Box>
        )}
      </VStack>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
        {/* These components are used, so the warning was likely a linter mistake */}
        <AlertDialogContent bg="ui.card" color="ui.text">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">Start: {selectedTest?.title}</AlertDialogHeader>
          <AlertDialogBody>Are you sure you wish to begin? The timer will start immediately.</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>Cancel</Button>
            <Button variant="solid-light" onClick={handleConfirmStart} ml={3}>
                Proceed
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Dashboard;