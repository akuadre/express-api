import { createHash, randomInt } from "node:crypto";

export const generateOtp = (length = 6) => {
  // return Math.floor(
  //   Math.pow(10, length - 1) + Math.random() * Math.pow(10, length - 1),
  // ).toString();

  const min = 10 ** (length - 1);
  const max = 10 ** length;
  return randomInt(min, max).toString();
};

export const hashOtp = (otp) => {
  return createHash("sha256").update(otp).digest("hex");
};
