import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { GetBalanceError } from "./GetBalanceError"
import { GetBalanceUseCase } from "./GetBalanceUseCase"

let statementsRepository: InMemoryStatementsRepository
let usersRepository: InMemoryUsersRepository
let getBalanceUseCase: GetBalanceUseCase

describe('Get Balance', () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository()
    usersRepository = new InMemoryUsersRepository()
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository)
  })

  it('should not be able to get balance from a non existing user', async () => {
    await expect(async () => {
      await getBalanceUseCase.execute({
        user_id: 'non existing user id'
      })
    }).rejects.toBeInstanceOf(GetBalanceError)
  })

  it('should be able to get the correct user balance', async () => {
    const user = await usersRepository.create({
      email: 'johndoe@gmail.com',
      name: 'John Doe',
      password: 'password'
    })

    await statementsRepository.create({
      amount: 3000,
      description: 'Salary',
      type: OperationType.DEPOSIT,
      user_id: user.id as string
    })

    await statementsRepository.create({
      amount: 3000,
      description: 'Salary',
      type: OperationType.DEPOSIT,
      user_id: user.id as string
    })

    const { balance: balance1 } = await getBalanceUseCase.execute({
      user_id: user.id as string
    })

    expect(balance1).toBe(6000)

    await statementsRepository.create({
      amount: 5000,
      description: 'Salary',
      type: OperationType.WITHDRAW,
      user_id: user.id as string
    })

    let { balance: balance2 } = await getBalanceUseCase.execute({
      user_id: user.id as string
    })

    expect(balance2).toBe(1000)
  })
})