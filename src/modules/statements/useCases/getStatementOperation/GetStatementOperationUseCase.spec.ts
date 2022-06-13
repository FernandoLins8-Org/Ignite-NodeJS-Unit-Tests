import { AppError } from "../../../../shared/errors/AppError"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { GetStatementOperationError } from "./GetStatementOperationError"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"

let statementsRepository: InMemoryStatementsRepository
let usersRepository: InMemoryUsersRepository
let getStatementOperationUseCase: GetStatementOperationUseCase

describe('Get Statement Operation', () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository()
    usersRepository = new InMemoryUsersRepository()
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository)
  })

  it('should be able to get an statement operation', async () => {
    const user = await usersRepository.create({
      email: 'johndoe@gmail.com',
      name: 'John Doe',
      password: 'random password'
    })

    const createdStatement = await statementsRepository.create({
      amount: 1000,
      description: 'Test statement op',
      type: OperationType.DEPOSIT,
      user_id: user.id as string
    })

    const statement = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: createdStatement.id as string
    })

    expect(statement).toHaveProperty('user_id')
    expect(statement).toHaveProperty('amount')
    expect(statement).toHaveProperty('description')
    expect(statement).toHaveProperty('type')
  })

  it('should not be able to get a statement of a non existing user', async () => {
    await expect(async () => {
      const user = await usersRepository.create({
        email: 'janedoe@gmail.com',
        name: 'Jane Doe',
        password: 'random password'
      })
  
      const createdStatement = await statementsRepository.create({
        amount: 1000,
        description: 'Test statement op',
        type: OperationType.DEPOSIT,
        user_id: user.id as string
      })
      
      await getStatementOperationUseCase.execute({
        user_id: 'non existing user id',
        statement_id: createdStatement.id as string
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it('should not be able to get a non existing statement', async () => {
    await expect(async () => {
      const user = await usersRepository.create({
        email: 'smith@gmail.com',
        name: 'Smith Doe',
        password: 'random password'
      })

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: 'non existing statement id'
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})