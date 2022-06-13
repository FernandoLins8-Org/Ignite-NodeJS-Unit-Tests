import { AppError } from "../../../../shared/errors/AppError"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementError } from "./CreateStatementError"
import { CreateStatementUseCase } from "./CreateStatementUseCase"

let statementsRepository: InMemoryStatementsRepository
let usersRepository: InMemoryUsersRepository
let createStatementUseCase: CreateStatementUseCase

describe('Create Statement', () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository()
    usersRepository = new InMemoryUsersRepository()
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
  })
  
  it('should be able to create a statement', async () => {
    const user = await usersRepository.create({
      email: 'userEmail@gmail.com',
      name: 'User',
      password: 'user password'
    })

    const statement = await createStatementUseCase.execute({
      amount: 1000,
      description: 'Deposit',
      type: OperationType.DEPOSIT,
      user_id: user.id as string
    })

    expect(statement).toHaveProperty('id')
  })

  // deposit', 'withdraw

  it('should not be able to create a statement for a non existing using', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 1000,
        description: 'Test Operation',
        type: OperationType.DEPOSIT,
        user_id: 'non existing user id'
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it('should be able to create a withdraw statement if user have enough funds', async () => {
    expect(async () => {
      const user = await usersRepository.create({
        email: 'randomuser@gmail.com',
        name: 'Random User',
        password: 'rand user password'
      })
  
      await createStatementUseCase.execute({
        amount: 1000,
        description: 'Test Operation',
        type: OperationType.DEPOSIT,
        user_id: user.id as string
      })
  
      await createStatementUseCase.execute({
        amount: 500,
        description: 'Withdraw test',
        type: OperationType.WITHDRAW,
        user_id: user.id as string
      })
    }).resolves
  })

  it('should not be able to create a withdraw statement without enough funds', async () => {
    expect(async () => {
      const user = await usersRepository.create({
        email: 'testDoe@gmail.com',
        name: 'Test Doe',
        password: 'rand password'
      })

      await createStatementUseCase.execute({
        amount: 500,
        description: 'Test Operation',
        type: OperationType.DEPOSIT,
        user_id: user.id as string
      })
  
      await createStatementUseCase.execute({
        amount: 1000,
        description: 'Test Operation',
        type: OperationType.WITHDRAW,
        user_id: user.id as string
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})