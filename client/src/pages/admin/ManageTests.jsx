import React, { useState, useEffect } from 'react'; // <-- THIS IS THE CORRECTED LINE
import { Box, Heading, VStack, FormControl, FormLabel, Input, Button, Checkbox, Spinner } from '@chakra-ui/react';
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
    adminService.getQuestions()
      .then(res => setAllQuestions(res.data))
      .catch(() => toast.error("Could not fetch question list."))
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
      <Box>
        <Heading as="h2" size="lg" mb={4}>Create New Test</Heading>
        <Box as="form" onSubmit={handleSubmit(onSubmit)} p={6} borderWidth={1} borderRadius="lg" boxShadow="sm">
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