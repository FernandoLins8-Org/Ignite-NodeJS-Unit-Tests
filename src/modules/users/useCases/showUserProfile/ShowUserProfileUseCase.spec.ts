import { AppError } from "../../../../shared/errors/AppError"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ShowUserProfileError } from "./ShowUserProfileError"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

let usersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase
let showUserProfileUseCase: ShowUserProfileUseCase

describe('Show User Profile', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository)
  })

  it('should be able to show a user info', async () => {
    const user = await createUserUseCase.execute({
      name: 'Jane Doe',
      email: 'jane@gmail.com',
      password: 'random password'
    })

    const userInfo = await showUserProfileUseCase.execute(user.id as string)

    expect(userInfo).toHaveProperty('id')
    expect(userInfo).toHaveProperty('name')
    expect(userInfo).toHaveProperty('email')
  })

  it('should not be able to show a non existing user info', async () => {
    await expect(async () => {
      await showUserProfileUseCase.execute('non existing id')
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})