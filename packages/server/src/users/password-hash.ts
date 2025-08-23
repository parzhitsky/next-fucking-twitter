import * as bcrypt from 'bcryptjs'

const PasswordHashBrand = Symbol('PasswordHash')

export type PasswordHash = string & {
  readonly [PasswordHashBrand]: typeof PasswordHashBrand
}

export async function create(password: string): Promise<PasswordHash> {
  const passwordHash = await bcrypt.hash(password, 10)

  return passwordHash as PasswordHash
}

export async function compare(password: string, passwordHash: PasswordHash): Promise<boolean> {
  return bcrypt.compare(password, passwordHash)
}
