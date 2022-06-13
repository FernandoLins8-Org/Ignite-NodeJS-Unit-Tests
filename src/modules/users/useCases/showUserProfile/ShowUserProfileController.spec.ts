import { app } from "../../../../app"

import request from 'supertest'
import { Connection, createConnection } from "typeorm";

let connection: Connection;

describe('Show User Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
  
  it('should be able to show a user profile info', async () => {
    const email = 'profileSuccessUser@gmail.com'
    const password = 'test'
    
    await request(app).post('/api/v1/users').send({
      name: 'profile success user',
      email,
      password
    })

    const { body } = await request(app).post('/api/v1/sessions').send({
      email,
      password
    })
    const { token } = body

    const res = await request(app).get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res.body.email).toBe(email)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('name')
    expect(res.body).toHaveProperty('created_at')
    expect(res.body).toHaveProperty('updated_at')
  })

  it('should not be able to show a user profile info without being authenticated', async () => {
    const res = await request(app).get('/api/v1/profile')
    expect(res.status).toBe(401)
  })
})