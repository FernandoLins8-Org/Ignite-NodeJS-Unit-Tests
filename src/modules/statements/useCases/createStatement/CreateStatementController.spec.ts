import { app } from "../../../../app"

import request from 'supertest'
import { Connection, createConnection } from "typeorm";

let connection: Connection;

describe('Create Statement Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
  
  it('should be able to create a deposit or withdraw statement', async () => {
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

    let res = await request(app).post('/api/v1/statements/deposit')
      .send({
        amount: 1000,
        description: 'test statement'
      })
      .set({
        Authorization: `Bearer ${token}`
      })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('user_id')
    expect(res.body).toHaveProperty('description')
    expect(res.body).toHaveProperty('amount')
    expect(res.body).toHaveProperty('type')
    expect(res.body).toHaveProperty('created_at')
    expect(res.body).toHaveProperty('updated_at')

    res = await request(app).post('/api/v1/statements/withdraw')
    .send({
      amount: 200,
      description: 'test statement'
    })
    .set({
      Authorization: `Bearer ${token}`
    })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('user_id')
    expect(res.body).toHaveProperty('description')
    expect(res.body).toHaveProperty('amount')
    expect(res.body).toHaveProperty('type')
    expect(res.body).toHaveProperty('created_at')
    expect(res.body).toHaveProperty('updated_at')
  })

  it(
    'should not be able to create a deposit statement if user does not have enough funds', 
    async () => {
      const email = 'userNotEnoughFunds@gmail'
      const password = 'test password'
      
      await request(app).post('/api/v1/users').send({
        name: 'user 2',
        email,
        password
      })
  
      const { body } = await request(app).post('/api/v1/sessions').send({
        email,
        password
      })
      const { token } = body

      const res = await request(app).post('/api/v1/statements/withdraw')
      .send({
        amount: 1000,
        description: 'test statement'
      })
      .set({
        Authorization: `Bearer ${token}`
      })

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Insufficient funds')
  })

  it('should not be able to create a statement for a non authenticated user', async () => {
    let res = await request(app).post('/api/v1/statements/withdraw')
    .send({
      amount: 1000,
      description: 'test statement'
    })
    expect(res.status).toBe(401)

    res = await request(app).post('/api/v1/statements/deposit')
    .send({
      amount: 1000,
      description: 'test statement'
    })
    expect(res.status).toBe(401)
  })
})