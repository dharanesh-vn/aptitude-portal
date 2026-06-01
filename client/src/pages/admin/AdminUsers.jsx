import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  Badge,
  Spinner,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminService from '../../api/adminService';
import { AuthContext } from '../../context/AuthContext';

const SUPER_ADMIN_EMAIL = 'admin@aptitude.com';

const AdminUsers = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, subsRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getAllSubmissions(),
      ]);
      setUsers(usersRes.data);
      setSubmissions(subsRes.data);
    } catch {
      toast.error('Could not load users or results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdminToggle = async (targetUser, nextIsAdmin) => {
    if (targetUser.email.toLowerCase() === SUPER_ADMIN_EMAIL && !nextIsAdmin) {
      toast.error('The primary super admin cannot be demoted.');
      return;
    }

    setUpdatingId(targetUser._id);
    try {
      const res = await adminService.setUserAdmin(targetUser._id, nextIsAdmin);
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, isAdmin: res.data.isAdmin } : u))
      );
      toast.success(
        nextIsAdmin
          ? `${targetUser.name} is now an admin.`
          : `${targetUser.name} is no longer an admin.`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update admin access.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="40vh">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Heading mb={1}>Users & results</Heading>
          <Text color="gray.600">
            Manage student accounts, grant admin access, and review all test submissions.
          </Text>
        </Box>
        <ChakraLink as={Link} to="/admin" color="brand.600" fontWeight="600">
          Back to admin home
        </ChakraLink>
      </Flex>

      <Tabs variant="enclosed" colorScheme="brand">
        <TabList>
          <Tab>Users ({users.length})</Tab>
          <Tab>All results ({submissions.length})</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <Box overflowX="auto" borderWidth={1} borderRadius="lg" bg="ui.card">
              <Table size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Role</Th>
                    <Th>Joined</Th>
                    <Th>Admin access</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((u) => {
                    const isSuper = u.email.toLowerCase() === SUPER_ADMIN_EMAIL;
                    return (
                      <Tr key={u._id}>
                        <Td fontWeight="600">{u.name}</Td>
                        <Td>{u.email}</Td>
                        <Td>
                          {isSuper ? (
                            <Badge colorScheme="purple">Super admin</Badge>
                          ) : u.isAdmin ? (
                            <Badge colorScheme="green">Admin</Badge>
                          ) : (
                            <Badge>Student</Badge>
                          )}
                        </Td>
                        <Td>{new Date(u.createdAt).toLocaleDateString()}</Td>
                        <Td>
                          <Switch
                            colorScheme="brand"
                            isChecked={!!u.isAdmin}
                            isDisabled={isSuper || updatingId === u._id}
                            onChange={(e) => handleAdminToggle(u, e.target.checked)}
                            aria-label={`Admin access for ${u.name}`}
                          />
                          {u._id === currentUser?._id && (
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              You
                            </Text>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>

          <TabPanel px={0}>
            <Box overflowX="auto" borderWidth={1} borderRadius="lg" bg="ui.card">
              <Table size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Student</Th>
                    <Th>Test</Th>
                    <Th>Score</Th>
                    <Th>Submitted</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {submissions.length === 0 ? (
                    <Tr>
                      <Td colSpan={4} textAlign="center" py={8} color="gray.500">
                        No submissions yet.
                      </Td>
                    </Tr>
                  ) : (
                    submissions.map((s) => {
                      const pct =
                        s.total > 0 ? ((s.score / s.total) * 100).toFixed(1) : '0';
                      return (
                        <Tr key={s._id}>
                          <Td>
                            <Text fontWeight="600">{s.user?.name || '—'}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {s.user?.email || '—'}
                            </Text>
                          </Td>
                          <Td>{s.test?.title || '—'}</Td>
                          <Td>
                            {s.score} / {s.total} ({pct}%)
                          </Td>
                          <Td>{new Date(s.createdAt).toLocaleString()}</Td>
                        </Tr>
                      );
                    })
                  )}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AdminUsers;
