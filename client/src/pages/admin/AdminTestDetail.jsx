import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box, Heading, Button, VStack, Text, Spinner, CheckboxGroup, Checkbox, SimpleGrid,
  useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Flex, FormControl, FormLabel, Input, Select, Table, Thead, Tbody, Tr, Th, Td
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import adminService from '../../api/adminService';

// --- Edit Test Details Modal Component ---
const EditTestDetailsModal = ({ isOpen, onClose, test, onTestUpdated }) => {
    const { register, handleSubmit, reset } = useForm();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (test) {
            reset({
                title: test.title,
                duration: test.duration,
            });
        }
    }, [test, reset]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await adminService.updateTest(test._id, {
                title: data.title,
                duration: Number(data.duration),
            });
            toast.success("Test details updated!");
            onTestUpdated(); // This refreshes the main page's data
            onClose();
        } catch (error) {
            toast.error("Failed to update test details.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
                <ModalHeader>Edit Test Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Test Title</FormLabel>
                            <Input {...register("title")} />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Duration (in minutes)</FormLabel>
                            <Input type="number" {...register("duration")} />
                        </FormControl>
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


// --- Manage Questions Modal Component ---
const ManageQuestionsModal = ({ isOpen, onClose, allQuestions, allCategories, testQuestionIds, onSaveChanges }) => {
    const [selectedIds, setSelectedIds] = useState(testQuestionIds);
    const [categoryFilter, setCategoryFilter] = useState('');
    
    const filteredQuestions = categoryFilter
        ? allQuestions.filter(q => q.category === categoryFilter)
        : allQuestions;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Manage Questions for Test</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Flex mb={4}>
                        <Select placeholder="Filter by category..." onChange={(e) => setCategoryFilter(e.target.value)}>
                            {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </Select>
                    </Flex>
                    <CheckboxGroup colorScheme="green" value={selectedIds} onChange={setSelectedIds}>
                        <VStack align="stretch" spacing={3}>
                            {filteredQuestions.map(q => (<Checkbox key={q._id} value={q._id}>{q.text}</Checkbox>))}
                        </VStack>
                    </CheckboxGroup>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                    <Button colorScheme="brand" onClick={() => onSaveChanges(selectedIds)}>Save Changes</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};


// --- Main Admin Test Detail Page Component ---
const AdminTestDetail = () => {
    const { testId } = useParams();
    const [test, setTest] = useState(null);
    const [allQuestions, setAllQuestions] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);

    const { isOpen: isManageOpen, onOpen: onManageOpen, onClose: onManageClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

    const fetchTestDetails = useCallback(async () => {
        // We set loading to true at the start of the fetch
        setLoading(true);
        try {
            const [testRes, bankRes] = await Promise.all([
                adminService.getTestById(testId),
                adminService.fetchFullQuestionBank(),
            ]);
            const violRes = await adminService.getViolationsForTest(testId).catch(() => ({ data: [] }));
            setTest(testRes.data);
            setAllQuestions(bankRes.questions);
            setAllCategories(bankRes.allCategories);
            setViolations(violRes.data || []);
        } catch (error) {
            toast.error("Could not fetch test details.");
            setTest(null);
        } finally {
            setLoading(false);
        }
    }, [testId]);

    useEffect(() => {
        fetchTestDetails();
    }, [fetchTestDetails]);

    const handleSaveChanges = async (newQuestionIds) => {
        try {
            await adminService.updateTest(testId, { questionIds: newQuestionIds });
            toast.success("Questions updated successfully!");
            onManageClose(); // Close the modal on success
            fetchTestDetails(); // Refresh data to show new list of questions
        } catch (error) {
            toast.error("Failed to update questions.");
        }
    };

    if (loading) return <Flex justify="center" align="center" h="50vh"><Spinner size="xl" /></Flex>;
    
    if (!test) {
        return (
            <Box>
                <Button as={Link} to="/admin" mb={4}>← Back to All Tests</Button>
                <Text mt={4} fontSize="lg">Test not found. It may have been deleted.</Text>
            </Box>
        );
    }
    
    return (
        <Box>
            <Button as={Link} to="/admin" mb={6}>← Back to All Tests</Button>
            
            <Flex justify="space-between" align="center" mb={8} direction={{ base: 'column', md: 'row' }} gap={4} wrap="wrap">
                <Box>
                    <Heading>{test.title}</Heading>
                    <Text color="gray.600">Duration: {test.duration} minutes</Text>
                </Box>
                <Flex gap={2} wrap="wrap">
                    <Button colorScheme="teal" variant="outline" onClick={() => adminService.exportTestScores(testId)}>
                        Export scores (CSV)
                    </Button>
                    <Button colorScheme="blue" onClick={onEditOpen}>Edit Details</Button>
                </Flex>
            </Flex>

            <Box mb={8} p={4} borderWidth={1} borderRadius="lg" bg="white" overflowX="auto">
                <Heading size="md" mb={4}>Proctoring violations</Heading>
                {violations.length === 0 ? (
                    <Text color="gray.600">No violations recorded for this test.</Text>
                ) : (
                    <Table size="sm">
                        <Thead>
                            <Tr>
                                <Th>Time</Th>
                                <Th>Student</Th>
                                <Th>Email</Th>
                                <Th>Type</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {violations.map((v) => (
                                <Tr key={v._id}>
                                    <Td>{new Date(v.timestamp).toLocaleString()}</Td>
                                    <Td>{v.user?.name}</Td>
                                    <Td>{v.user?.email}</Td>
                                    <Td>{v.type}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </Box>

            <Box p={6} bg="gray.50" borderRadius="lg">
                <Flex justify="space-between" align="center">
                    <Heading size="lg">Questions in this test ({test.questions.length})</Heading>
                    <Button colorScheme="green" onClick={onManageOpen}>+ Add / Manage Questions</Button>
                </Flex>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={6}>
                {test.questions.length > 0 ? (
                    test.questions.map(q => (
                        <Box key={q._id} p={4} borderWidth={1} borderRadius="lg" shadow="sm" bg="white">
                            <Text fontWeight="bold">{q.text}</Text>
                            <Text fontSize="sm" color="gray.500" mt={2}>Category: {q.category}</Text>
                        </Box>
                    ))
                ) : (
                    <Text p={4} color="gray.500" gridColumn="span 2">No questions have been added to this test yet.</Text>
                )}
            </SimpleGrid>

            {/* Render the modals */}
            <ManageQuestionsModal
                isOpen={isManageOpen}
                onClose={onManageClose}
                allQuestions={allQuestions}
                allCategories={allCategories}
                testQuestionIds={test.questions.map(q => q._id)}
                onSaveChanges={handleSaveChanges}
            />
            
            <EditTestDetailsModal
                isOpen={isEditOpen}
                onClose={onEditClose}
                test={test}
                onTestUpdated={fetchTestDetails}
            />
        </Box>
    );
};
export default AdminTestDetail;