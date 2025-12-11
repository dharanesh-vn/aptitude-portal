import React, { useState, useEffect, useRef } from 'react';
import { Box, Heading, VStack, FormControl, FormLabel, Input, Button, Text, SimpleGrid, Card, CardBody, CardHeader, Spinner, Flex, Textarea, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogBody, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, HStack, Tag } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import adminService from '../../api/adminService';

const EditQuestionModal = ({ isOpen, onClose, question, onQuestionUpdated }) => {
    const { register, handleSubmit, reset } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        if (question) {
            reset({
                text: question.text,
                options: question.options.join(', '),
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
                category: question.category,
            });
        }
    }, [question, reset]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        const questionData = {
            text: data.text,
            options: data.options.split(',').map(opt => opt.trim()),
            correctAnswer: data.correctAnswer.trim(),
            explanation: data.explanation,
            category: data.category.trim()
        };
        try {
            await adminService.updateQuestion(question._id, questionData);
            toast.success("Question updated successfully!");
            onQuestionUpdated();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update question.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
            <ModalOverlay />
            <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
                <ModalHeader>Edit Question</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isRequired><FormLabel>Question Text</FormLabel><Textarea {...register("text")} /></FormControl>
                        <FormControl isRequired><FormLabel>Category</FormLabel><Input {...register("category")} /></FormControl>
                        <FormControl isRequired><FormLabel>Options (comma-separated)</FormLabel><Input {...register("options")} /></FormControl>
                        <FormControl isRequired><FormLabel>Correct Answer</FormLabel><Input {...register("correctAnswer")} /></FormControl>
                        <FormControl isRequired><FormLabel>Explanation</FormLabel><Textarea {...register("explanation")} /></FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                    <Button type="submit" colorScheme="brand" isLoading={isLoading}>Save Changes</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <Flex justify="center" align="center" mt={8}>
            <Button onClick={() => onPageChange(currentPage - 1)} isDisabled={currentPage === 1}>Previous</Button>
            <Text mx={4}>Page {currentPage} of {totalPages}</Text>
            <Button onClick={() => onPageChange(currentPage + 1)} isDisabled={currentPage === totalPages}>Next</Button>
        </Flex>
    );
};

const AdminQuestionsList = () => {
    const { register, handleSubmit, reset } = useForm();
    const [data, setData] = useState({ questions: [], totalPages: 1 });
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreating, setIsCreating] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [questionToModify, setQuestionToModify] = useState(null);
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const cancelRef = useRef();

    const fetchQuestions = async (page) => {
        setIsFetching(true);
        try {
            const res = await adminService.getQuestions(page);
            setData(res.data);
        } catch (error) { toast.error("Could not fetch questions."); }
        finally { setIsFetching(false); }
    };
    
    useEffect(() => { fetchQuestions(currentPage); }, [currentPage]);
    
    const onSubmitCreate = async (formData) => {
        setIsCreating(true);
        const questionData = {
            text: formData.text,
            options: formData.options.split(',').map(option => option.trim()),
            correctAnswer: formData.correctAnswer.trim(),
            explanation: formData.explanation,
            category: formData.category.trim(),
        };
        try {
            await adminService.createQuestion(questionData);
            toast.success("Question created!");
            reset();
            if (currentPage === 1) {
                fetchQuestions(1);
            } else {
                setCurrentPage(1);
            }
        } catch (error) { toast.error(error.response?.data?.message || "Failed to create question."); }
        finally { setIsCreating(false); }
    };

    const handleDeleteClick = (question) => {
        setQuestionToModify(question);
        onDeleteOpen();
    };
    const handleEditClick = (question) => {
        setQuestionToModify(question);
        onEditOpen();
    };

    const confirmDelete = async () => {
        if (!questionToModify) return;
        try {
            await adminService.deleteQuestion(questionToModify._id);
            toast.success("Question deleted.");
            fetchQuestions(currentPage);
        } catch (error) { toast.error("Failed to delete question."); }
        finally {
            onDeleteClose();
            setQuestionToModify(null);
        }
    };

    return (
        <VStack spacing={10} align="stretch">
            <Box>
                <Heading as="h2" size="lg" mb={4}>Create New Question</Heading>
                <Box as="form" onSubmit={handleSubmit(onSubmitCreate)} p={6} borderWidth={1} borderRadius="lg" boxShadow="sm">
                    <SimpleGrid columns={{ base: 1, md: 2}} spacing={4}>
                        <FormControl isRequired gridColumn="span 2"><FormLabel>Question Text</FormLabel><Textarea {...register("text")} /></FormControl>
                        <FormControl isRequired><FormLabel>Category</FormLabel><Input {...register("category")} placeholder="e.g., Logical Reasoning" /></FormControl>
                        <FormControl isRequired><FormLabel>Options (comma-separated)</FormLabel><Input {...register("options")} placeholder="Option A, Option B, ..." /></FormControl>
                        <FormControl isRequired><FormLabel>Correct Answer</FormLabel><Input {...register("correctAnswer")} placeholder="Must match one option" /></FormControl>
                        <FormControl isRequired gridColumn="span 2"><FormLabel>Explanation</FormLabel><Textarea {...register("explanation")} /></FormControl>
                    </SimpleGrid>
                    <Button mt={4} type="submit" colorScheme="brand" isLoading={isCreating} alignSelf="flex-start">Create Question</Button>
                </Box>
            </Box>

            <Box>
                <Heading as="h2" size="lg" mb={4}>Question Bank ({data.questions.length} showing)</Heading>
                {isFetching ? <Flex justify="center"><Spinner size="xl" /></Flex> : (
                    <VStack align="stretch" spacing={4}>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            {data.questions.map(q => (
                                <Card key={q._id}>
                                    <CardHeader pb={2}>
                                        <HStack justify="space-between">
                                            <Heading size="sm">ID: {q._id}</Heading>
                                            <Tag colorScheme="teal">{q.category}</Tag>
                                        </HStack>
                                    </CardHeader>
                                    <CardBody>
                                        <Text fontWeight="bold">{q.text}</Text>
                                        <HStack mt={4} spacing={4}>
                                            <Button size="sm" colorScheme="blue" onClick={() => handleEditClick(q)}>Edit</Button>
                                            <Button size="sm" colorScheme="red" onClick={() => handleDeleteClick(q)}>Delete</Button>
                                        </HStack>
                                    </CardBody>
                                </Card>
                            ))}
                        </SimpleGrid>
                        <Pagination currentPage={currentPage} totalPages={data.totalPages} onPageChange={setCurrentPage} />
                    </VStack>
                )}
            </Box>

            <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
                <AlertDialogOverlay><AlertDialogContent>
                    <AlertDialogHeader>Delete Question</AlertDialogHeader>
                    <AlertDialogBody>Are you sure? This will remove the question permanently and from all tests.</AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onDeleteClose}>Cancel</Button>
                        <Button colorScheme="red" onClick={confirmDelete} ml={3}>Delete</Button>
                    </AlertDialogFooter>
                </AlertDialogContent></AlertDialogOverlay>
            </AlertDialog>
            
            {questionToModify && <EditQuestionModal isOpen={isEditOpen} onClose={onEditClose} question={questionToModify} onQuestionUpdated={() => fetchQuestions(currentPage)} />}
        </VStack>
    );
};

export default AdminQuestionsList;