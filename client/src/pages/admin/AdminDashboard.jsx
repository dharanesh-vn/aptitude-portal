import React from 'react';
import { Box, Heading, Text, VStack, SimpleGrid, Card, CardHeader, CardBody, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <Heading>Admin Dashboard</Heading>
        <Text>Use the sections below to manage the application content.</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} mt={10}>
        {/* Card for Managing Questions */}
        <Card variant="outline">
          <CardHeader>
            <Heading size='md'>Manage Questions</Heading>
          </CardHeader>
          <CardBody>
            <Text>View all existing questions in the question bank or create new ones.</Text>
            <Button as={Link} to="/admin/questions" colorScheme="brand" mt={4}>
              Go to Questions
            </Button>
          </CardBody>
        </Card>

        {/* Card for Managing Tests */}
        <Card variant="outline">
          <CardHeader>
            <Heading size='md'>Manage Tests</Heading>
          </CardHeader>
          <CardBody>
            <Text>Create new tests by selecting questions from the bank or edit existing tests.</Text>
            <Button as={Link} to="/admin/tests" colorScheme="brand" mt={4}>
              Go to Tests
            </Button>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default AdminDashboard;