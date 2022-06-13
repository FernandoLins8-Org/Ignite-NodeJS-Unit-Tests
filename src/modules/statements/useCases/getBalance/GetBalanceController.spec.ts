import { app } from "../../../../app"

import request from 'supertest'
import { Connection, createConnection } from "typeorm";

let connection: Connection;

describe('Get Balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able get balance from a user', async () => {
    const email = 'testUser1@gmail'
    const password = 'test password'
    
    await request(app).post('/api/v1/users').send({
      name: 'user 1',
      email,
      password
    })

    const { body } = await request(app).post('/api/v1/sessions').send({
      email,
      password
    })
    const { token } = body

    const res = await request(app).get('/api/v1/statements/balance')
    .set({
      Authorization: `Bearer ${token}`
    })

    expect(res.body.balance).toBe(0)
  })

  it('should not be able to get balance from a non authenticated user', async () => {
    const res = await request(app).get('/api/v1/statements/balance')
    expect(res.status).toBe(401)
  })

  it('should be able to get the balance from a user correctly', async () => {
    const email = 'testUser1@gmail'
    const password = 'test password'
    
    await request(app).post('/api/v1/users').send({
      name: 'user 1',
      email,
      password
    })

    const { body } = await request(app).post('/api/v1/sessions').send({
      email,
      password
    })
    const { token } = body

    // Creates deposit statement and checks if balance is correct
    await request(app).post('/api/v1/statements/deposit')
    .send({
      amount: 1000,
      description: 'test statement'
    })
    .set({
      Authorization: `Bearer ${token}`
    })

    let res = await request(app).get('/api/v1/statements/balance')
    .set({
      Authorization: `Bearer ${token}`
    })
    expect(res.body.balance).toBe(1000)

    // Creates withdraw statement and checks if balance is correct
    await request(app).post('/api/v1/statements/withdraw')
    .send({
      amount: 500,
      description: 'test statement'
    })
    .set({
      Authorization: `Bearer ${token}`
    })

    res = await request(app).get('/api/v1/statements/balance')
    .set({
      Authorization: `Bearer ${token}`
    })
    expect(res.body.balance).toBe(500)

    // Creates withdraw statement and checks if balance is correct
    await request(app).post('/api/v1/statements/withdraw')
    .send({
      amount: 500,
      description: 'test statement'
    })
    .set({
      Authorization: `Bearer ${token}`
    })

    res = await request(app).get('/api/v1/statements/balance')
    .set({
      Authorization: `Bearer ${token}`
    })
    expect(res.body.balance).toBe(0)
  })
})