import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Radio,
  RadioGroup,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import testService from '../api/testService';

const PROCTOR_WARN_MSG =
  'Proctoring notice: repeated tab or fullscreen violations will submit your attempt automatically.';
const VIOLATION_WARN = (n) =>
  `Violation recorded (${n}/3). ${PROCTOR_WARN_MSG}`;

const Test = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const testContainerRef = useRef(null);

  const [testData, setTestData] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [expiresAtMs, setExpiresAtMs] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const isSubmitting = useRef(false);
  const violationCount = useRef(0);

  const syncTimerFromServer = useCallback(() => {
    if (!expiresAtMs) return;
    const secs = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
    setTimeLeft(secs);
    if (secs <= 0 && !isSubmitting.current) {
      handleSubmitAndExitRef.current?.();
    }
  }, [expiresAtMs]);

  const handleSubmitAndExitRef = useRef(null);

  const handleSubmitAndExit = useCallback(() => {
    if (isSubmitting.current) return;
    if (!attemptId) return;
    isSubmitting.current = true;

    const toastId = toast.loading('Submitting your test...');

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    testService
      .submitTest(testId, { attemptId, answers })
      .then((res) => {
        toast.update(toastId, {
          render: 'Submission successful!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
        navigate(`/results/${res.data._id}`, { state: { result: res.data }, replace: true });
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Submission failed.';
        toast.update(toastId, {
          render: msg,
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        });
        navigate('/dashboard', { replace: true });
      });
  }, [answers, attemptId, navigate, testId]);

  handleSubmitAndExitRef.current = handleSubmitAndExit;

  const recordViolation = useCallback(
    async (type) => {
      if (!attemptId || isSubmitting.current) return;
      try {
        await testService.logViolation(testId, { attemptId, type });
        violationCount.current += 1;
        const n = violationCount.current;
        if (n >= 3) {
          toast.error('Maximum proctoring violations reached. Submitting your attempt.');
          handleSubmitAndExit();
        } else {
          toast.warning(VIOLATION_WARN(n), { autoClose: 6000 });
        }
      } catch {
        toast.error('Could not record proctoring event.');
      }
    },
    [attemptId, handleSubmitAndExit, testId]
  );

  useEffect(() => {
    testService
      .startTest(testId)
      .then((res) => {
        const data = res.data;
        setTestData({
          _id: data._id,
          title: data.title,
          duration: data.duration,
        });
        setQuestions(data.questions || []);
        setAttemptId(data.attemptId);
        const exp = new Date(data.expiresAt).getTime();
        setExpiresAtMs(exp);
        setLoading(false);

        const elem = testContainerRef.current;
        if (elem?.requestFullscreen) {
          elem.requestFullscreen().catch(() => {});
        }
      })
      .catch((err) => {
        if (err.response?.status === 409) {
          toast.info('You already submitted this test.');
          navigate('/dashboard');
          return;
        }
        const msg = err.response?.data?.message || 'Could not load the test.';
        toast.error(msg);
        navigate('/dashboard');
      });
  }, [testId, navigate]);

  useEffect(() => {
    if (loading || !expiresAtMs) return undefined;

    syncTimerFromServer();
    const timer = setInterval(() => {
      syncTimerFromServer();
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.hidden) recordViolation('tab_switch');
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) recordViolation('fullscreen_exit');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [loading, expiresAtMs, recordViolation, syncTimerFromServer]);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="80vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Heading size="md">Loading Test...</Heading>
        </VStack>
      </Flex>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const handleAnswerChange = (option) =>
    setAnswers((prev) => ({ ...prev, [currentQuestion._id]: option }));
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex((p) => p + 1);
  };
  const handlePrev = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((p) => p - 1);
  };

  return (
    <Box ref={testContainerRef} p={{ base: 4, md: 8 }} bg="white" minH="100vh" w="100%">
      <Alert status="warning" variant="subtle" mb={4} borderRadius="md">
        <AlertIcon />
        {PROCTOR_WARN_MSG} On your third violation, your attempt is submitted automatically.
      </Alert>

      <Flex
        justify="space-between"
        align="center"
        mb={6}
        direction={{ base: 'column', md: 'row' }}
        gap={4}
      >
        <Heading size="lg">{testData?.title}</Heading>
        <Box bg="red.500" color="white" px={4} py={2} borderRadius="md" fontWeight="bold">
          Time Left: {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
        </Box>
      </Flex>

      <Box p={{ base: 4, md: 6 }} shadow="md" borderWidth="1px" borderRadius="lg">
        {currentQuestion ? (
          <>
            <Heading size="md" mb={4}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Heading>
            <Text fontSize="lg">{currentQuestion.text}</Text>
            <RadioGroup
              onChange={handleAnswerChange}
              value={answers[currentQuestion._id] || ''}
              mt={6}
            >
              <VStack spacing={4} align="stretch">
                {currentQuestion.options.map((option) => (
                  <Radio key={option} value={option} size="lg">
                    {option}
                  </Radio>
                ))}
              </VStack>
            </RadioGroup>
          </>
        ) : (
          <Text>Loading question...</Text>
        )}
      </Box>

      <Flex justify="space-between" mt={8}>
        <Button onClick={handlePrev} isDisabled={currentQuestionIndex === 0}>
          Previous
        </Button>
        {currentQuestionIndex < questions.length - 1 ? (
          <Button colorScheme="brand" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button colorScheme="green" onClick={handleSubmitAndExit}>
            Finish & Submit
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default Test;
