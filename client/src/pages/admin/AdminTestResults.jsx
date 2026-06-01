import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardBody,
  Button,
  Select,
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import adminService from '../../api/adminService';
import testService from '../../api/testService';

const AdminTestResultsIndex = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testService
      .getAllTests()
      .then((res) => setTests(res.data))
      .catch(() => toast.error('Could not load tests.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Flex justify="center" minH="40vh" align="center">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  return (
    <Box>
      <Heading mb={2}>Test-wise results</Heading>
      <Text color="gray.600" mb={8}>
        Select a test to view every student submission, averages, and export options.
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {tests.map((t) => (
          <Card key={t._id} variant="outline" shadow="sm" _hover={{ shadow: 'md' }}>
            <CardBody>
              <Heading size="md" color="brand.700" mb={2}>
                {t.title}
              </Heading>
              <Text color="gray.600" fontSize="sm" mb={4}>
                Duration: {t.duration} minutes
              </Text>
              <Button as={Link} to={`/admin/results/${t._id}`} colorScheme="brand" size="sm">
                View results
              </Button>
            </CardBody>
          </Card>
        ))}
        {tests.length === 0 && (
          <Text color="gray.500">No tests published yet. Create a test first.</Text>
        )}
      </SimpleGrid>
    </Box>
  );
};

const AdminTestResultsDetail = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getTestResults(testId),
      testService.getAllTests(),
    ])
      .then(([resultsRes, testsRes]) => {
        setData(resultsRes.data);
        setTests(testsRes.data);
      })
      .catch(() => toast.error('Could not load test results.'))
      .finally(() => setLoading(false));
  }, [testId]);

  if (loading) {
    return (
      <Flex justify="center" minH="40vh" align="center">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  if (!data) return <Text>Test not found.</Text>;

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Button as={Link} to="/admin/results" size="sm" variant="ghost" colorScheme="brand" mb={2}>
            ← All tests
          </Button>
          <Heading>{data.test.title}</Heading>
          <Text color="gray.600" mt={1}>
            {data.test.questionCount} questions · {data.test.duration} min
          </Text>
        </Box>
        <Flex gap={2} align="center" flexWrap="wrap">
          {tests.length > 1 && (
            <Select
              maxW="280px"
              value={testId}
              onChange={(e) => navigate(`/admin/results/${e.target.value}`)}
            >
              {tests.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title}
                </option>
              ))}
            </Select>
          )}
          <Button
            colorScheme="teal"
            variant="outline"
            onClick={() => adminService.exportTestScores(testId)}
          >
            Export CSV
          </Button>
        </Flex>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Attempts</StatLabel>
              <StatNumber color="brand.600">{data.summary.attempts}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Average</StatLabel>
              <StatNumber color="brand.600">{data.summary.averagePercent}%</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Highest</StatLabel>
              <StatNumber color="green.600">{data.summary.highestPercent}%</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Lowest</StatLabel>
              <StatNumber color="orange.600">{data.summary.lowestPercent}%</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Box overflowX="auto" borderWidth={1} borderRadius="lg" bg="white">
        <Table size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Student</Th>
              <Th>Email</Th>
              <Th isNumeric>Score</Th>
              <Th isNumeric>%</Th>
              <Th>Submitted</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.results.length === 0 ? (
              <Tr>
                <Td colSpan={5} textAlign="center" py={10} color="gray.500">
                  No submissions for this test yet.
                </Td>
              </Tr>
            ) : (
              data.results.map((row) => (
                <Tr key={row.submissionId}>
                  <Td fontWeight="600">{row.studentName}</Td>
                  <Td>{row.email}</Td>
                  <Td isNumeric>
                    {row.score} / {row.total}
                  </Td>
                  <Td isNumeric fontWeight="600" color="brand.700">
                    {row.percentage}%
                  </Td>
                  <Td>{new Date(row.submittedAt).toLocaleString()}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

const AdminTestResults = () => {
  const { testId } = useParams();
  if (!testId) return <AdminTestResultsIndex />;
  return <AdminTestResultsDetail />;
};

export default AdminTestResults;
