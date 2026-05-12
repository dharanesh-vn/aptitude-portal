import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  Spinner,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
} from '@chakra-ui/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { AuthContext } from '../context/AuthContext';
import testService from '../api/testService';
import submissionService from '../api/submissionService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const TestCard = ({ test, onStart }) => (
  <Box variant="glass" p={6} width="full">
    <VStack align="stretch" spacing={4}>
      <Heading size="md" color="white">
        {test.title}
      </Heading>
      <Text color="gray.300">Duration: {test.duration} minutes</Text>
      <Text fontWeight="bold" color="orange.200">
        Proctored: repeated tab or fullscreen violations may auto-submit after warnings.
      </Text>
      <Button variant="solid-light" onClick={() => onStart(test)} size="lg" mt={2}>
        Start Test
      </Button>
    </VStack>
  </Box>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    let cancelled = false;
    Promise.all([testService.getAllTests(), submissionService.getMyHistory()])
      .then(([testsRes, histRes]) => {
        if (!cancelled) {
          setTests(testsRes.data);
          setSubmissions(histRes.data);
        }
      })
      .catch(() => toast.error('Could not load dashboard data.'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const takenTestIds = new Set(submissions.map((s) => s.test?._id || s.test).filter(Boolean));
  const availableToStart = tests.filter((t) => !takenTestIds.has(t._id));

  const chartRows = [...submissions]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((s, i) => ({
      label: `${i + 1}`,
      title: s.test?.title?.slice(0, 12) || 'Test',
      pct: s.total > 0 ? Math.round((s.score / s.total) * 1000) / 10 : 0,
    }));

  const avgPct =
    submissions.length > 0
      ? submissions.reduce((acc, s) => acc + (s.total > 0 ? (s.score / s.total) * 100 : 0), 0) /
        submissions.length
      : 0;

  const handleStartClick = (test) => {
    setSelectedTest(test);
    onOpen();
  };

  const handleConfirmStart = () => {
    onClose();
    if (selectedTest) {
      navigate(`/test/${selectedTest._id}`);
    }
  };

  return (
    <>
      <VStack spacing={8} align="stretch" p={{ base: 4, md: 8 }}>
        <Heading as="h1" size="xl" color="white">
          Welcome, {user?.name}
        </Heading>

        {loading ? (
          <Flex justify="center" align="center" h="40vh">
            <Spinner size="xl" color="white" />
          </Flex>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Card bg="white" shadow="md">
                <CardBody>
                  <Stat>
                    <StatLabel>Tests available</StatLabel>
                    <StatNumber color="brand.500">{availableToStart.length}</StatNumber>
                    <StatHelpText>Not yet attempted</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg="white" shadow="md">
                <CardBody>
                  <Stat>
                    <StatLabel>Tests completed</StatLabel>
                    <StatNumber color="brand.500">{submissions.length}</StatNumber>
                    <StatHelpText>Out of {tests.length} published</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card bg="white" shadow="md">
                <CardBody>
                  <Stat>
                    <StatLabel>Average score</StatLabel>
                    <StatNumber color="brand.500">{avgPct.toFixed(1)}%</StatNumber>
                    <StatHelpText>Across all attempts</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {chartRows.length > 0 && (
              <Box variant="glass" p={6} borderRadius="lg">
                <Heading size="md" color="white" mb={4}>
                  Score history
                </Heading>
                <Box h="280px" color="black">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartRows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis domain={[0, 100]} unit="%" />
                      <Tooltip
                        formatter={(value) => [`${value}%`, 'Score']}
                        labelFormatter={(label, payload) =>
                          payload?.[0]?.payload?.title || `Attempt ${label}`
                        }
                      />
                      <Line type="monotone" dataKey="pct" stroke="#0047AB" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}

            <Heading size="md" color="white">
              Available tests
            </Heading>
            {availableToStart.length > 0 ? (
              <VStack spacing={6} align="stretch">
                {availableToStart.map((test) => (
                  <TestCard key={test._id} test={test} onStart={handleStartClick} />
                ))}
              </VStack>
            ) : (
              <Box variant="glass" p={10} textAlign="center">
                <Heading size="md" color="white">
                  {tests.length === 0
                    ? 'No tests are available right now.'
                    : 'You have started or completed all available tests.'}
                </Heading>
                <Text mt={2} color="gray.300">
                  Visit your history in submissions or check back when admins publish new assessments.
                </Text>
              </Box>
            )}
          </>
        )}
      </VStack>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
        <AlertDialogContent bg="ui.card" color="gray.800">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Start: {selectedTest?.title}
          </AlertDialogHeader>
          <AlertDialogBody>
            The server-side timer begins immediately. Proctoring warnings apply before auto-submit.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
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
