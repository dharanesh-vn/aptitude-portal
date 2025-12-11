import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Heading, Text, Button, VStack, Radio, RadioGroup, Flex, Spinner } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import testService from '../api/testService';

const Test = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const testContainerRef = useRef(null);
  
  const [testData, setTestData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [answers, setAnswers] = useState(() => {
    try {
      const savedAnswers = localStorage.getItem(`answers_${testId}`);
      return savedAnswers ? JSON.parse(savedAnswers) : {};
    } catch (error) {
      console.error("Failed to parse saved answers from localStorage", error);
      return {};
    }
  });

  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const isSubmitting = useRef(false);

  useEffect(() => {
    if (!loading && timeLeft > 0) {
        localStorage.setItem(`answers_${testId}`, JSON.stringify(answers));
        localStorage.setItem(`timeLeft_${testId}`, timeLeft.toString());
    }
  }, [answers, timeLeft, testId, loading]);

  const handleSubmitAndExit = useCallback(() => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    
    localStorage.removeItem(`answers_${testId}`);
    localStorage.removeItem(`timeLeft_${testId}`);

    const toastId = toast.loading("Submitting your test...");
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    testService.submitTest(testId, answers)
      .then(res => {
        toast.update(toastId, { render: "Submission Successful!", type: "success", isLoading: false, autoClose: 3000 });
        navigate(`/results/${res.data._id}`, { state: { result: res.data }, replace: true });
      })
      .catch(err => {
        toast.update(toastId, { render: "Submission Failed!", type: "error", isLoading: false, autoClose: 5000 });
        navigate('/dashboard', { replace: true });
      });
  }, [answers, navigate, testId]);

  useEffect(() => {
    const savedTimeLeft = localStorage.getItem(`timeLeft_${testId}`);

    testService.startTest(testId)
      .then(res => {
        setTestData(res.data);
        setQuestions(res.data.questions);
        if (savedTimeLeft && parseInt(savedTimeLeft, 10) > 0) {
            setTimeLeft(parseInt(savedTimeLeft, 10));
            toast.info("Your previous progress has been restored!", { autoClose: 4000 });
        } else {
            setTimeLeft(res.data.duration * 60);
        }
        setLoading(false);
        const elem = testContainerRef.current;
        if (elem && elem.requestFullscreen) {
          elem.requestFullscreen().catch(err => console.error(`Fullscreen Error: ${err.message}`));
        }
      })
      .catch(err => {
        toast.error('Could not load the test.');
        navigate('/dashboard');
      });
  }, [testId, navigate]);

  useEffect(() => {
    if (loading) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAndExit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    const handleVisibilityChange = () => { if (document.hidden) handleSubmitAndExit(); };
    const handleFullscreenChange = () => { if (!document.fullscreenElement) handleSubmitAndExit(); };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [loading, handleSubmitAndExit]);

  if (loading) {
    return (
        <Flex justify="center" align="center" height="80vh">
            <VStack spacing={4}>
                {/* This is the line where Spinner was used but not imported */}
                <Spinner size="xl" color="brand.500" thickness="4px" />
                <Heading size="md">Loading Test...</Heading>
            </VStack>
        </Flex>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const handleAnswerChange = (option) => setAnswers({ ...answers, [currentQuestion._id]: option });
  const handleNext = () => { if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1); };
  const handlePrev = () => { if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1); };

  return (
    <Box ref={testContainerRef} p={{base: 4, md: 8}} bg="white" minH="100vh" w="100%">
      <Flex justify="space-between" align="center" mb={6} direction={{ base: 'column', md: 'row' }} gap={4}>
        <Heading size="lg">{testData?.title}</Heading>
        <Box bg="red.500" color="white" px={4} py={2} borderRadius="md" fontWeight="bold">
          Time Left: {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
        </Box>
      </Flex>

      <Box p={{base: 4, md: 6}} shadow="md" borderWidth="1px" borderRadius="lg">
        {currentQuestion ? <>
        <Heading size="md" mb={4}>Question {currentQuestionIndex + 1} of {questions.length}</Heading>
        <Text fontSize="lg">{currentQuestion.text}</Text>
        <RadioGroup onChange={handleAnswerChange} value={answers[currentQuestion._id] || ''} mt={6}>
          <VStack spacing={4} align="stretch">
            {currentQuestion.options.map(option => (
              <Radio key={option} value={option} size="lg">{option}</Radio>
            ))}
          </VStack>
        </RadioGroup>
        </> : <Text>Loading question...</Text>}
      </Box>

      <Flex justify="space-between" mt={8}>
        <Button onClick={handlePrev} isDisabled={currentQuestionIndex === 0}>Previous</Button>
        {currentQuestionIndex < questions.length - 1 ? (
          <Button colorScheme="brand" onClick={handleNext}>Next</Button>
        ) : (
          <Button colorScheme="green" onClick={handleSubmitAndExit}>Finish & Submit</Button>
        )}
      </Flex>
    </Box>
  );
};

export default Test;