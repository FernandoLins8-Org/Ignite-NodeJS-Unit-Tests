import { AppError } from "../../../../shared/errors/AppError"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError"

let usersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase
let authenticateUserUseCase: AuthenticateUserUseCase

describe('Authenticate User', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)
  })

  it('should be able to authenticate a user', async () => {
    const email = 'test@gmail.com'
    const password = 'randompassword'

    const user = await createUserUseCase.execute({
      name: 'test user',
      email,
      password
    })

    const result = await authenticateUserUseCase.execute({
      email,
      password
    })

    expect(result).toHaveProperty('token')
    expect(result.user).toEqual({
      id: user.id,
      name: user.name,
      email,
    })
  })

  it('should not be able to authenticate a non existing user', async () => {
    await expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'emailThatDoesNotExists@gmail.com',
        password: 'password'
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it('should not be able to authenticate with an incorrect password', async () => {
    await expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'John Doe',
        email: 'johndoe@gmail.com',
        password: 'random password'
      })
      
      await authenticateUserUseCase.execute({
        email: user.email,
        password: 'incorrect password'
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})