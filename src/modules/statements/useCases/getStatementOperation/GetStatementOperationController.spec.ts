import { app } from "../../../../app"

import request from 'supertest'
import { Connection, createConnection } from "typeorm";

let connection: Connection;

describe('Get Statement Operation Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
  
  it('should be able to get a statement', async () => {
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

    // Create and Checks if can get deposit operations
    const resCreateDeposit = await request(app).post('/api/v1/statements/deposit')
      .send({
        amount: 1000,
        description: 'test statement'
      })
      .set({
        Authorization: `Bearer ${token}`
      })
    
    const resGetDepositOp = await request(app).get(`/api/v1/statements/${resCreateDeposit.body.id}`)
      .set({
        Authorization: `Bearer ${token}`
      })
      
    expect(resGetDepositOp.body.id).toBe(resCreateDeposit.body.id)

    // Create and Checks if can get withdraw operations
    const resCreateWithdraw = await request(app).post('/api/v1/statements/withdraw')
    .send({
      amount: 1000,
      description: 'test statement'
    })
    .set({
      Authorization: `Bearer ${token}`
    })

    const resGetWithdrawOp = await request(app).get(`/api/v1/statements/${resCreateWithdraw.body.id}`)
      .set({
        Authorization: `Bearer ${token}`
      })
    
    expect(resGetWithdrawOp.body.id).toBe(resCreateWithdraw.body.id)
  })

  it('should not be able to get a statement if is not authenticated', async () => {
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

    // Create and Checks if can get deposit operations
    const resCreateDeposit = await request(app).post('/api/v1/statements/deposit')
      .send({
        amount: 1000,
        description: 'test statement'
      })
      .set({
        Authorization: `Bearer ${token}`
      })
    
    const resGetDepositOp = await request(app).get(`/api/v1/statements/${resCreateDeposit.body.id}`)
    expect(resGetDepositOp.status).toBe(401)
  })
})