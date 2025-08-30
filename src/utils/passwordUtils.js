import bcrypt from "bcrypt";

export async function hashPassword(plainPwd) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPwd, salt);
}

export async function comparePassword(plainPwd, hashedPwd) {
  return bcrypt.compare(plainPwd, hashedPwd);
}
