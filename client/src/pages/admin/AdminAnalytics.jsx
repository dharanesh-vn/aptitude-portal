import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Spinner,
  Flex,
  Card,
  CardBody,
} from '@chakra-ui/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { toast } from 'react-toastify';
import adminService from '../../api/adminService';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getAnalytics()
      .then((res) => setData(res.data))
      .catch(() => toast.error('Could not load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="40vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!data) {
    return <Text>No analytics available.</Text>;
  }

  const dist = data.scoreDistribution || {};
  const distChart = [
    { range: '0–25%', count: dist['0-25'] || 0 },
    { range: '25–50%', count: dist['25-50'] || 0 },
    { range: '50–75%', count: dist['50-75'] || 0 },
    { range: '75–100%', count: dist['75-100'] || 0 },
  ];

  const overTime = (data.averageScoresOverTime || []).map((row) => ({
    period: row.period,
    avg: Math.round(row.averagePercent * 10) / 10,
  }));

  return (
    <Box>
      <Heading mb={2}>Analytics</Heading>
      <Text color="gray.600" mb={8}>
        Institutional overview of participation and performance.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={10}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Students</StatLabel>
              <StatNumber>{data.overview.totalStudents}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Tests</StatLabel>
              <StatNumber>{data.overview.totalTests}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Submissions</StatLabel>
              <StatNumber>{data.overview.totalSubmissions}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={10}>
        <Box p={4} borderWidth={1} borderRadius="lg" bg="white">
          <Heading size="md" mb={4}>
            Score distribution (all attempts)
          </Heading>
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Submissions" fill="#0047AB" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        <Box p={4} borderWidth={1} borderRadius="lg" bg="white">
          <Heading size="md" mb={4}>
            Average percent score over time
          </Heading>
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(v) => [`${v}%`, 'Avg']} />
                <Legend />
                <Line type="monotone" dataKey="avg" name="Avg %" stroke="#F59E0B" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </SimpleGrid>

      <Box mb={8}>
        <Heading size="md" mb={4}>
          Average score by test
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
          {(data.averageScorePerTest || []).map((row) => (
            <Flex
              key={row.testTitle}
              justify="space-between"
              p={3}
              borderWidth={1}
              borderRadius="md"
              bg="gray.50"
            >
              <Text fontWeight="600">{row.testTitle}</Text>
              <Text>{row.averagePercent.toFixed(1)}% ({row.submissions} attempts)</Text>
            </Flex>
          ))}
        </SimpleGrid>
      </Box>

      <Box>
        <Heading size="md" mb={4}>
          Accuracy by category
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
          {(data.categoryAccuracy || []).map((row) => (
            <Flex
              key={row.category}
              justify="space-between"
              p={3}
              borderWidth={1}
              borderRadius="md"
              bg="gray.50"
            >
              <Text fontWeight="600">{row.category}</Text>
              <Text>
                {row.accuracyPercent.toFixed(1)}% ({row.attempts} graded items)
              </Text>
            </Flex>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default AdminAnalytics;
