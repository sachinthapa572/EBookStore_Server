import bcrypt from "bcryptjs";

export const hashToken = async (token: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(token, salt);
};
