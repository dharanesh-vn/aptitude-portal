import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { BarChart3, Users, FileText, ClipboardList } from 'lucide-react';
import adminService from '../../api/adminService';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getAnalytics()
      .then((res) => setOverview(res.data.overview))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: 'Analytics',
      desc: 'Score distributions, trends, and category accuracy across the institution.',
      to: '/admin/analytics',
      icon: BarChart3,
    },
    {
      title: 'Test results',
      desc: 'View submissions test-by-test, averages, and export CSV reports.',
      to: '/admin/results',
      icon: FileText,
    },
    {
      title: 'Manage tests',
      desc: 'Create timed assessments and assign questions from the bank.',
      to: '/admin/tests',
      icon: ClipboardList,
    },
    {
      title: 'Users & roles',
      desc: 'List students, review all results, and grant admin access.',
      to: '/admin/users',
      icon: Users,
    },
  ];

  return (
    <Box>
      <Heading color="brand.800" mb={2}>
        Admin dashboard
      </Heading>
      <Text color="gray.600" mb={8}>
        Central control for tests, questions, analytics, and user management.
      </Text>

      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner size="lg" color="brand.500" />
        </Flex>
      ) : overview ? (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={10}>
          <Card bg="brand.50" borderColor="brand.200" borderWidth={1}>
            <CardBody>
              <Stat>
                <StatLabel color="brand.700">Students</StatLabel>
                <StatNumber color="brand.800">{overview.totalStudents}</StatNumber>
                <StatHelpText>Non-admin accounts</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg="white" shadow="sm">
            <CardBody>
              <Stat>
                <StatLabel>Published tests</StatLabel>
                <StatNumber color="brand.600">{overview.totalTests}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card bg="white" shadow="sm">
            <CardBody>
              <Stat>
                <StatLabel>Total submissions</StatLabel>
                <StatNumber color="brand.600">{overview.totalSubmissions}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      ) : null}

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {cards.map(({ title, desc, to, icon: Ico }) => (
          <Card key={title} variant="outline" shadow="md" borderColor="gray.200">
            <CardHeader pb={2}>
              <Flex align="center" gap={3}>
                <Flex
                  w={10}
                  h={10}
                  bg="brand.500"
                  color="white"
                  borderRadius="lg"
                  align="center"
                  justify="center"
                >
                  <Ico size={20} />
                </Flex>
                <Heading size="md" color="gray.800">
                  {title}
                </Heading>
              </Flex>
            </CardHeader>
            <CardBody pt={0}>
              <Text color="gray.600" mb={4}>
                {desc}
              </Text>
              <Button as={Link} to={to} colorScheme="brand">
                Open
              </Button>
            </CardBody>
          </Card>
        ))}

        <Card variant="outline" shadow="md" borderColor="gray.200">
          <CardHeader>
            <Heading size="md">Question bank</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <Text color="gray.600" mb={4}>
              Maintain categories, options, correct answers, and explanations.
            </Text>
            <Button as={Link} to="/admin/questions" colorScheme="brand">
              Manage questions
            </Button>
            <Button
              as={Link}
              to="/admin/tests/create"
              variant="outline"
              colorScheme="brand"
              mt={2}
              w="full"
            >
              Create test with questions
            </Button>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default AdminDashboard;
