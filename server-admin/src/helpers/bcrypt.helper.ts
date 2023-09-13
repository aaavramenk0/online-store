import * as rootBcrypt from 'bcrypt'


class Bcrypt {
  public async hash(data: string): Promise<string> {
    const salt = await rootBcrypt.genSalt(10);
    return await rootBcrypt.hash(data, salt);
  }
  public async compare(arg1: string, arg2: string): Promise<boolean> {
    return await rootBcrypt.compare(arg1, arg2)
  }
}

export const bcrypt = new Bcrypt()
