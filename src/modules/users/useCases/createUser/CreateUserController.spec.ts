import { app } from "../../../../app"

import request from 'supertest'
import { Connection, createConnection } from "typeorm";

let connection: Connection;

describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
  
  it('should be able to create a user', async () => {
    const res = await request(app).post('/api/v1/users').send({
      name: 'test user',
      email: 'testuser@gmail.com',
      password: 'test'
    })

    expect(res.status).toBe(201)
  })

  it('should not be able to create a user with an already registered email', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'test user',
      email: 'sameEmail@gmail.com',
      password: 'test'
    })

    const res = await request(app).post('/api/v1/users').send({
      name: 'test user',
      email: 'sameEmail@gmail.com',
      password: 'test'
    })

    expect(res.status).toBe(400)
  })
})