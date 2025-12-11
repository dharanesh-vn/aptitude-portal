import React, { useState, useEffect } from 'react';
import { Box, Heading, VStack, Text, Spinner, Flex, Card, CardBody, Stat, StatNumber, StatHelpText, StatLabel } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import submissionService from '../api/submissionService';

const Profile = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        submissionService.getMyHistory()
            .then(res => setHistory(res.data))
            .catch(() => toast.error("Could not fetch your test history."))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <Flex justify="center"><Spinner size="xl" /></Flex>;
    }

    return (
        <Box>
            <Heading mb={8}>My Test History</Heading>
            {history.length > 0 ? (
                <VStack spacing={6} align="stretch">
                    {history.map(sub => (
                        <Card key={sub._id} variant="outline" shadow="sm">
                            <CardBody>
                                <Flex justify="space-between" align="center">
                                    <Box>
                                        <Heading size="md">{sub.test?.title || "Test (Title Not Found)"}</Heading>
                                        <Text fontSize="sm" color="gray.500">
                                            Taken on: {new Date(sub.createdAt).toLocaleDateString()} at {new Date(sub.createdAt).toLocaleTimeString()}
                                        </Text>
                                    </Box>
                                    <Stat textAlign="right" w="100px">
                                        <StatLabel>Score</StatLabel>
                                        <StatNumber>{sub.score} / {sub.total}</StatNumber>
                                        <StatHelpText>
                                            {sub.total > 0 ? ((sub.score / sub.total) * 100).toFixed(1) : 0}%
                                        </StatHelpText>
                                    </Stat>
                                </Flex>
                            </CardBody>
                        </Card>
                    ))}
                </VStack>
            ) : (
                <Text fontSize="lg" color="gray.600">You haven't completed any tests yet. Go to the dashboard to take one!</Text>
            )}
        </Box>
    );
};

export default Profile;