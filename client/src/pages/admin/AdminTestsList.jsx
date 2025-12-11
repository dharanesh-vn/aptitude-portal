import React, { useState, useEffect, useRef } from 'react';
import { Box, Heading, Button, VStack, Text, Spinner, Flex, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, AlertDialog, AlertDialogBody, AlertDialogHeader, AlertDialogContent, AlertDialogFooter, AlertDialogOverlay } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminService from '../../api/adminService';
import testService from '../../api/testService';

// Reusable modal for creating a new test
const CreateTestModal = ({ isOpen, onClose, onTestCreated }) => {
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(30);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!title.trim() || !duration || duration <= 0) {
            toast.error("Valid title and duration are required.");
            return;
        }
        setIsLoading(true);
        try {
            await adminService.createTest({ title, duration, questionIds: [] });
            toast.success(`Test "${title}" created successfully!`);
            onTestCreated(); // This is a function passed as a prop to refresh the list
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create test.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create New Test</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Test Title</FormLabel>
                            <Input placeholder="e.g., Final Aptitude Exam" onChange={(e) => setTitle(e.target.value)} />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <Input type="number" defaultValue={30} onChange={(e) => setDuration(Number(e.target.value))} />
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                    <Button colorScheme="brand" onClick={handleCreate} isLoading={isLoading}>Create Test</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

// Main page component for listing tests
const AdminTestsList = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [testToDelete, setTestToDelete] = useState(null);
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();

    const fetchTests = async () => {
        setLoading(true);
        try {
            const res = await testService.getAllTests();
            setTests(res.data);
        } catch (error) {
            toast.error("Could not fetch tests.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchTests();
    }, []);

    const handleDeleteClick = (test) => {
        setTestToDelete(test);
        onDeleteOpen();
    };
    
    const confirmDelete = async () => {
        if (!testToDelete) return;
        try {
            await adminService.deleteTest(testToDelete._id);
            toast.success(`Test "${testToDelete.title}" deleted.`);
            fetchTests(); // Refresh the list of tests
        } catch (error) {
            toast.error("Failed to delete test.");
        } finally {
            onDeleteClose();
            setTestToDelete(null);
        }
    };

    return (
        <Box>
            <Flex justify="space-between" align="center" mb={8}>
                <Heading>Manage Tests</Heading>
                <Flex>
                    {/* Link to the brand new AdminQuestionsList page */}
                    <Button as={Link} to="/admin/questions" mr={4}>Manage Question Bank</Button>
                    <Button colorScheme="green" onClick={onCreateOpen}>+ Create New Test</Button>
                </Flex>
            </Flex>
            {loading ? <Flex justify="center"><Spinner size="xl" /></Flex> : (
                <VStack spacing={4} align="stretch">
                    {tests.length > 0 ? tests.map(test => (
                        <Flex key={test._id} p={4} borderWidth={1} borderRadius="lg" justify="space-between" align="center" shadow="sm">
                            <Box as={Link} to={`/admin/tests/${test._id}`} flex="1" _hover={{ bg: 'gray.50', borderRadius: 'md' }} p={2}>
                                <Heading size="md">{test.title}</Heading>
                                <Text color="gray.600">Duration: {test.duration} mins</Text>
                            </Box>
                            {/* Stop propagation so clicking delete doesn't navigate */}
                            <Button colorScheme="red" size="sm" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDeleteClick(test); }}>Delete</Button>
                        </Flex>
                    )) : <Text p={4} bg="gray.50" borderRadius="md">No tests found. Create one to get started.</Text>}
                </VStack>
            )}
            <CreateTestModal isOpen={isCreateOpen} onClose={onCreateClose} onTestCreated={fetchTests} />
            
            <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose} isCentered>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete Test</AlertDialogHeader>
                        <AlertDialogBody>Are you sure you want to delete "{testToDelete?.title}"? This cannot be undone.</AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>Cancel</Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={3}>Delete</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default AdminTestsList;