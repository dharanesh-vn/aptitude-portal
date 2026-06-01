import React, { useState, useEffect, useRef } from 'react';
import { Box, Heading, Button, VStack, Text, Spinner, Flex, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, AlertDialog, AlertDialogBody, AlertDialogHeader, AlertDialogContent, AlertDialogFooter, AlertDialogOverlay } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminService from '../../api/adminService';
import testService from '../../api/testService';

// Reusable modal for creating a new test
const CreateTestModal = ({ isOpen, onClose, onTestCreated, onCreated }) => {
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
            const res = await adminService.createTest({ title, duration, questionIds: [] });
            toast.success(`Test "${title}" created. Add questions on the next screen.`);
            onTestCreated();
            onClose();
            if (onCreated && res.data?._id) {
                onCreated(res.data._id);
            }
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.response?.data?.errors?.[0]?.msg ||
                'Failed to create test.';
            toast.error(msg);
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
    const navigate = useNavigate();
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
            <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={3}>
                <Heading>Manage Tests</Heading>
                <Flex flexWrap="wrap" gap={2}>
                    <Button as={Link} to="/admin" variant="outline" size="sm">Admin home</Button>
                    <Button as={Link} to="/admin/questions" variant="outline">Question bank</Button>
                    <Button as={Link} to="/admin/tests/create" variant="outline" colorScheme="teal">
                        Create with questions
                    </Button>
                    <Button colorScheme="green" onClick={onCreateOpen}>+ Quick create</Button>
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
            <CreateTestModal
                isOpen={isCreateOpen}
                onClose={onCreateClose}
                onTestCreated={fetchTests}
                onCreated={(id) => navigate(`/admin/tests/${id}`)}
            />
            
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