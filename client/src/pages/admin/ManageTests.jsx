import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Heading, VStack, FormControl, FormLabel, Input, Button, Checkbox, Spinner, Flex } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import adminService from '../../api/adminService';

const ManageTests = () => {
  const { register, handleSubmit, reset } = useForm();
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    adminService
      .fetchFullQuestionBank()
      .then(({ questions }) => setAllQuestions(questions))
      .catch(() => toast.error('Could not fetch question list.'))
      .finally(() => setIsFetching(false));
  }, []);

  const handleCheckboxChange = (questionId) => {
    setSelectedQuestionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const onSubmit = async (data) => {
    if (selectedQuestionIds.size === 0) {
      toast.error("Please select at least one question.");
      return;
    }

    setIsLoading(true);
    const testData = {
      title: data.title,
      duration: Number(data.duration),
      questionIds: Array.from(selectedQuestionIds),
    };

    try {
      await adminService.createTest(testData);
      toast.success(`Test "${data.title}" created successfully!`);
      reset();
      setSelectedQuestionIds(new Set());
      // In a real app, you would also refresh the list of existing tests.
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create test.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={10} align="stretch">
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
        <Heading as="h2" size="lg">Create test with questions</Heading>
        <Button as={Link} to="/admin/tests" variant="outline" size="sm">
          Back to test list
        </Button>
      </Flex>
      <Box>
        <Box as="form" onSubmit={handleSubmit(onSubmit)} p={6} borderWidth={1} borderRadius="lg" boxShadow="sm" bg="ui.card">
          <VStack spacing={6}>
            <FormControl isRequired>
              <FormLabel>Test Title</FormLabel>
              <Input {...register("title")} placeholder="e.g., General Aptitude - Set 2" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Duration (in minutes)</FormLabel>
              <Input type="number" {...register("duration")} placeholder="e.g., 20" />
            </FormControl>
            
            <FormControl>
                <FormLabel>Select Questions ({selectedQuestionIds.size} selected)</FormLabel>
                {isFetching ? <Spinner /> : (
                    <Box p={4} borderWidth={1} borderRadius="md" maxHeight="300px" overflowY="auto">
                        <VStack align="stretch">
                            {allQuestions.map(q => (
                                <Checkbox key={q._id} onChange={() => handleCheckboxChange(q._id)}>
                                    {q.text}
                                </Checkbox>
                            ))}
                        </VStack>
                    </Box>
                )}
            </FormControl>

            <Button type="submit" colorScheme="brand" isLoading={isLoading} alignSelf="flex-start">
              Create Test
            </Button>
          </VStack>
        </Box>
      </Box>
    </VStack>
  );
};

export default ManageTests;