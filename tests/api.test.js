const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Comment = require('../models/Comment');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/testdb');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await Task.deleteMany({});
  await Comment.deleteMany({});
});

describe('Task APIs', () => {
  it('should create a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test Task' })
      .set('Cookie', 'connect.sid=s%3Afake; Path=/; HttpOnly'); // Mock session
    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toBe('Test Task');
  });

  it('should get tasks', async () => {
    await new Task({ title: 'Test', createdBy: 'fakeid' }).save();
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should delete a task (superuser)', async () => {
    const task = await new Task({ title: 'Delete Me', createdBy: 'fakeid' }).save();
    const res = await request(app)
      .delete(`/api/tasks/${task._id}`)
      .set('Cookie', 'connect.sid=s%3Aadmin; Path=/; HttpOnly'); // Mock superuser
    expect(res.statusCode).toEqual(200);
  });
});

describe('Comment APIs', () => {
  it('should add a comment to task', async () => {
    const taskId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post('/api/comments')
      .send({ text: 'Test Comment', task: taskId })
      .set('Cookie', 'connect.sid=s%3Afake; Path=/; HttpOnly');
    expect(res.statusCode).toEqual(201);
    expect(res.body.text).toBe('Test Comment');
  });

  it('should edit a comment', async () => {
    const comment = await new Comment({ text: 'Old', task: 'fake', createdBy: 'fakeid' }).save();
    const res = await request(app)
      .put(`/api/comments/${comment._id}`)
      .send({ text: 'Updated' })
      .set('Cookie', 'connect.sid=s%3Afake; Path=/; HttpOnly');
    expect(res.statusCode).toEqual(200);
    expect(res.body.text).toBe('Updated');
  });

  it('should delete a comment', async () => {
    const comment = await new Comment({ text: 'Delete', task: 'fake', createdBy: 'fakeid' }).save();
    const res = await request(app)
      .delete(`/api/comments/${comment._id}`)
      .set('Cookie', 'connect.sid=s%3Afake; Path=/; HttpOnly');
    expect(res.statusCode).toEqual(200);
  });
});