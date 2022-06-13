import { app } from "../../../../app"

import request from 'supertest'
import { Connection, createConnection } from "typeorm";

let connection: Connection;

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
  
  it('should be able to authenticate a user', async () => {
    const name = 'test user'
    const email = 'testUser1@gmail.com'
    
    await request(app).post('/api/v1/users').send({
      name,
      email,
      password: 'test'
    })
    
    const res = await request(app).post('/api/v1/sessions').send({
      email: 'testUser1@gmail.com',
      password: 'test'
    })

    expect(res.body.user.name).toBe(name)
    expect(res.body.user.email).toBe(email)
  })

  it('should not be able to authenticate a non existing user', async () => {
    const res = await request(app).post('/api/v1/sessions').send({
      email: 'nonExistingEmail@gmail.com',
      password: 'test'
    })

    expect(res.status).toBe(401)
  })

  it('should not be able to authenticate a user with an incorrect password', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'incorrect password user',
      email: 'incorrectPassUser@gmail.com',
      password: 'random pass'
    })

    const res = await request(app).post('/api/v1/sessions').send({
      email: 'incorrectPassUser@gmail.com',
      password: 'incorrect password'
    })

    expect(res.status).toBe(401)
  })
})