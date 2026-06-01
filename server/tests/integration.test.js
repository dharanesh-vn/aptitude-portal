const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Question = require('../models/Question');
const Test = require('../models/Test');

const api = request.agent(app);

describe('Auth routes', () => {
  it('registers a valid user', async () => {
    const res = await api.post('/api/auth/register').send({
      name: 'Student One',
      email: 's1@cit.edu.in',
      password: 'password12',
    });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('s1@cit.edu.in');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects short passwords', async () => {
    const res = await api.post('/api/auth/register').send({
      name: 'X',
      email: 'bad@cit.edu.in',
      password: 'short',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('logs in with valid credentials', async () => {
    await User.create({
      name: 'Login User',
      email: 'login@cit.edu.in',
      password: 'password12',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@cit.edu.in',
      password: 'password12',
    });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('login@cit.edu.in');
  });

  it('rejects duplicate email registration', async () => {
    await User.create({
      name: 'Dup',
      email: 'dup@cit.edu.in',
      password: 'password12',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Other',
      email: 'dup@cit.edu.in',
      password: 'password12',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('rejects invalid credentials', async () => {
    await User.create({
      name: 'U2',
      email: 'u2@cit.edu.in',
      password: 'password12',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'u2@cit.edu.in',
      password: 'wrong-password',
    });
    expect(res.status).toBe(401);
  });
});

describe('Admin protection', () => {
  it('returns 403 for non-admin on analytics', async () => {
    await User.create({
      name: 'Student',
      email: 'stu@cit.edu.in',
      password: 'password12',
    });

    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({
      email: 'stu@cit.edu.in',
      password: 'password12',
    });

    const res = await agent.get('/api/admin/analytics');
    expect(res.status).toBe(403);
  });
});

describe('Admin user management', () => {
  it('allows admin to list users and get test results', async () => {
    await User.create({
      name: 'Admin',
      email: 'admin@aptitude.com',
      password: 'Admin@123',
      isAdmin: true,
    });

    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({
      email: 'admin@aptitude.com',
      password: 'Admin@123',
    });

    const usersRes = await agent.get('/api/admin/users');
    expect(usersRes.status).toBe(200);
    expect(Array.isArray(usersRes.body)).toBe(true);
    expect(usersRes.body.some((u) => u.isAdmin)).toBe(true);

    const q = await Question.create({
      text: 'Sample',
      options: ['A', 'B'],
      correctAnswer: 'A',
      explanation: 'x',
      category: 'Demo',
    });
    const testDoc = await Test.create({
      title: 'Demo Test',
      duration: 10,
      questions: [q._id],
    });

    const resultsRes = await agent.get(`/api/admin/tests/${testDoc._id}/results`);
    expect(resultsRes.status).toBe(200);
    expect(resultsRes.body.test.title).toBe('Demo Test');
    expect(resultsRes.body.results).toEqual([]);
  });
});

describe('Submission routes', () => {
  it('returns submission history for logged-in user', async () => {
    await User.create({
      name: 'Hist User',
      email: 'hist@cit.edu.in',
      password: 'password12',
    });

    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({
      email: 'hist@cit.edu.in',
      password: 'password12',
    });

    const res = await agent.get('/api/submissions/my-history');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});

describe('Authenticated session', () => {
  it('returns current user from /api/auth/me', async () => {
    await User.create({
      name: 'Me User',
      email: 'me@cit.edu.in',
      password: 'password12',
    });

    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({
      email: 'me@cit.edu.in',
      password: 'password12',
    });

    const res = await agent.get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('me@cit.edu.in');
  });
});

describe('submitTest scoring integrity', () => {
  it('rejects foreign question IDs in answers payload', async () => {
    await User.create({
      name: 'Test Taker',
      email: 'taker@cit.edu.in',
      password: 'password12',
    });

    const foreignQuestion = await Question.create({
      text: 'Foreign Q',
      options: ['A', 'B'],
      correctAnswer: 'A',
      explanation: 'x',
      category: 'Other',
    });

    const q1 = await Question.create({
      text: 'Q1',
      options: ['a', 'b'],
      correctAnswer: 'a',
      explanation: 'x',
      category: 'Cat',
    });

    const q2 = await Question.create({
      text: 'Q2',
      options: ['c', 'd'],
      correctAnswer: 'c',
      explanation: 'x',
      category: 'Cat',
    });

    const testDoc = await Test.create({
      title: 'Integrity Test',
      duration: 60,
      questions: [q1._id, q2._id],
    });

    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({
      email: 'taker@cit.edu.in',
      password: 'password12',
    });

    const start = await agent.get(`/api/tests/${testDoc._id}/start`);
    expect(start.status).toBe(200);
    const { attemptId } = start.body;

    const badSubmit = await agent.post(`/api/tests/${testDoc._id}/submit`).send({
      attemptId,
      answers: {
        [q1._id.toString()]: 'a',
        [foreignQuestion._id.toString()]: 'A',
      },
    });

    expect(badSubmit.status).toBe(400);

    const goodSubmit = await agent.post(`/api/tests/${testDoc._id}/submit`).send({
      attemptId,
      answers: {
        [q1._id.toString()]: 'a',
        [q2._id.toString()]: 'c',
      },
    });

    expect(goodSubmit.status).toBe(201);
    expect(goodSubmit.body.score).toBe(2);
    expect(goodSubmit.body.total).toBe(2);

    const dup = await agent.post(`/api/tests/${testDoc._id}/submit`).send({
      attemptId,
      answers: {
        [q1._id.toString()]: 'a',
        [q2._id.toString()]: 'c',
      },
    });
    expect(dup.status).toBe(400);
    expect(dup.body.message).toMatch(/no longer active/i);
  });
});
