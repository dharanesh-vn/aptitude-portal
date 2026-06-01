import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import submissionService from '../api/submissionService';

const Results = () => {
  const { submissionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (result?._id) return undefined;

    if (!submissionId) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    submissionService
      .getSubmissionForReview(submissionId)
      .then((res) => {
        if (cancelled) return;
        const s = res.data;
        setResult({
          _id: s._id,
          score: s.score,
          total: s.total,
          test: s.test,
        });
      })
      .catch(() => {
        if (!cancelled) setResult(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [submissionId, result?._id]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  if (!result?._id) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Heading as="h2" size="xl" mt={6} mb={2}>
          No Result Found
        </Heading>
        <Text color="gray.500">Test results are shown here after completing a test.</Text>
        <Button colorScheme="brand" mt={6} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const percentage = result.total > 0 ? ((result.score / result.total) * 100).toFixed(2) : 0;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await submissionService.downloadReport(result._id);
      toast.success('Report downloaded');
    } catch {
      toast.error('Could not download report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <VStack spacing={8} align="center" justify="center" minH="70vh">
      <Heading size="2xl">Test Completed!</Heading>
      {result.test?.title && (
        <Text color="gray.600" fontSize="lg">
          {result.test.title}
        </Text>
      )}
      <Box p={8} shadow="xl" borderWidth="1px" borderRadius="lg" w="full" maxW="md" textAlign="center" bg="white">
        <Stat>
          <StatLabel fontSize="lg">Your Score</StatLabel>
          <StatNumber fontSize="6xl" color="brand.500">
            {result.score} / {result.total}
          </StatNumber>
          <StatHelpText fontSize="2xl">{percentage}%</StatHelpText>
        </Stat>
      </Box>
      <VStack spacing={4}>
        <Button
          colorScheme="brand"
          variant="outline"
          size="lg"
          onClick={handleDownload}
          isLoading={downloading}
        >
          Download PDF report
        </Button>
        <Button as={Link} to={`/review/${result._id}`} colorScheme="green" size="lg">
          Review answers
        </Button>
        <Button onClick={() => navigate('/dashboard')} size="lg" variant="outline">
          Back to Dashboard
        </Button>
      </VStack>
    </VStack>
  );
};

export default Results;
