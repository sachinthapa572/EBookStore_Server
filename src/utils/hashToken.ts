import bcrypt from "bcryptjs";

export const hashToken: IhashToken = async (token) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(token, salt);
};

type IhashToken = (token: string) => Promise<string>;
