import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Heading, Text, VStack, Spinner, Flex, Button } from '@chakra-ui/react';
import submissionService from '../api/submissionService';
import { toast } from 'react-toastify';

const QuestionReview = ({ question, userAnswer, index }) => {
    return (
        <Box p={6} borderWidth="1px" borderRadius="xl" shadow="sm" bg="white">
            <Heading size="md" mb={6}>Question {index + 1}: {question.text}</Heading>
            <VStack align="stretch" spacing={3}>
                {question.options.map(option => {
                    const isUserChoice = (option === userAnswer);
                    const isCorrectChoice = (option === question.correctAnswer);

                    const getOptionStyle = () => {
                        if (isCorrectChoice) {
                            return { bg: "green.100", borderColor: "green.300", fontWeight: "bold" };
                        }
                        if (isUserChoice && !isCorrectChoice) {
                            return { bg: "red.100", borderColor: "red.300", textDecoration: "line-through" };
                        }
                        return { bg: "gray.50", borderColor: "gray.200" };
                    };
                    
                    const styleProps = getOptionStyle();
                    return (<Text key={option} p={3} borderRadius="md" borderWidth="1px" {...styleProps}>{option}</Text>);
                })}
            </VStack>
            <Box mt={6} p={4} bg="gray.100" borderRadius="md">
                <Heading size="sm" color="gray.600">Explanation</Heading>
                <Text mt={2} color="gray.700">{question.explanation || "No explanation provided."}</Text>
            </Box>
        </Box>
    );
};

const ReviewPage = () => {
    const { submissionId } = useParams();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReview = useCallback(async () => {
        setLoading(true);
        try {
            const res = await submissionService.getSubmissionForReview(submissionId);
            setSubmission(res.data);
        } catch (error) {
            toast.error("Could not load submission review.");
            setSubmission(null);
        } finally {
            setLoading(false);
        }
    }, [submissionId]);
    
    useEffect(() => {
        fetchReview();
    }, [fetchReview]);

    if (loading) return <Flex justify="center" align="center" h="50vh"><Spinner size="xl" /></Flex>;
    
    if (!submission) {
        return (
            <Box textAlign="center">
                <Heading>Review Not Found</Heading>
                <Text mt={4}>This review may have been deleted or the link is incorrect.</Text>
                <Button as={Link} to="/profile" mt={6} colorScheme="brand">Go to My Profile</Button>
            </Box>
        );
    }

    return (
        <Box>
            <Flex align="center" justify="space-between" mb={8}>
                <Box>
                    <Heading as="h1" size="lg">Reviewing: {submission.test.title}</Heading>
                    <Text color="gray.500" fontSize="lg">Your Score: {submission.score} / {submission.total}</Text>
                </Box>
                 <Button as={Link} to="/profile">← Back to My History</Button>
            </Flex>
            <VStack spacing={8} align="stretch">
                {submission.test.questions.map((q, index) => (
                    <QuestionReview key={q._id} question={q} userAnswer={submission.answers[q._id]} index={index} />
                ))}
            </VStack>
        </Box>
    );
};

export default ReviewPage;