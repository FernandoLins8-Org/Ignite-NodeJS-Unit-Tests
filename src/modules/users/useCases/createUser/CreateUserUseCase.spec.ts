import { AppError } from "../../../../shared/errors/AppError"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserError } from "./CreateUserError"
import { CreateUserUseCase } from "./CreateUserUseCase"

let usersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase

describe('Create User', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
  })

  it('should be able to create a user', async () => {
    const user = await createUserUseCase.execute({
      name: 'test user',
      email: 'test@gmail.com',
      password: 'randompassword'
    })

    expect(user).toHaveProperty('id')
  })

  it('should not be able to create a user with an existing email', async ()=> {
    await expect(async () => {
      await createUserUseCase.execute({
        name: 'test user',
        email: 'test@gmail.com',
        password: 'randompassword'
      })
  
      await createUserUseCase.execute({
        name: 'test user',
        email: 'test@gmail.com',
        password: 'randompassword'
      })
    }).rejects.toBeInstanceOf(CreateUserError)
  })

  it('should not save a password in plain text', async () => {
    const password = 'randompassword'
    
    const user = await createUserUseCase.execute({
      name: 'test user',
      email: 'test@gmail.com',
      password
    })

    expect(user.password).not.toBe(password)
  })
})