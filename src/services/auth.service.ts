import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/validations/auth.schema";

const JWT_EXPIRES_IN = "7d";
const PASSWORD_SALT_ROUNDS = 12;
export const AUTH_COOKIE_NAME = "auth_token";

type UserWithPassword = {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash?: string | null;
};

type SafeUser = Omit<UserWithPassword, "passwordHash">;

export type AuthResult = {
  user: SafeUser;
  token: string;
  cookie: {
    name: string;
    value: string;
    options: {
      httpOnly: true;
      secure: boolean;
      sameSite: "lax";
      path: "/";
      maxAge: number;
    };
  };
};

export type JwtPayload = {
  userId: string;
  email: string;
  role: string;
};

export class AuthServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AuthServiceError";
    this.statusCode = statusCode;
  }
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AuthServiceError("JWT_SECRET is not configured", 500);
  }
  return secret;
};

const sanitizeUser = (user: UserWithPassword): SafeUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});

export const generateAuthCookie = (token: string): AuthResult["cookie"] => ({
  name: AUTH_COOKIE_NAME,
  value: token,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  },
});

export const hashPassword = async (plainPassword: string): Promise<string> => {
  return bcrypt.hash(plainPassword, PASSWORD_SALT_ROUNDS);
};

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const signJwtToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
};

export const verifyJwtToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded !== "object" || decoded === null) {
      throw new AuthServiceError("Invalid token", 401);
    }

    const { userId, email, role } = decoded as Partial<JwtPayload>;
    if (!userId || !email || !role) {
      throw new AuthServiceError("Invalid token payload", 401);
    }

    return { userId, email, role };
  } catch (err) {
    if (err instanceof AuthServiceError) throw err;
    throw new AuthServiceError("Invalid or expired token", 401);
  }
};

export const validateCredentials = <T extends "register" | "login">(
  type: T,
  input: unknown,
): T extends "register" ? RegisterInput : LoginInput => {
  if (type === "register") {
    return registerSchema.parse(input) as T extends "register" ? RegisterInput : LoginInput;
  }
  return loginSchema.parse(input) as T extends "register" ? RegisterInput : LoginInput;
};

export const registerUser = async (input: unknown): Promise<AuthResult> => {
  const parsedInput = validateCredentials("register", input);

  const existingUser = await prisma.user.findUnique({
    where: { email: parsedInput.email },
  });

  if (existingUser) {
    throw new AuthServiceError("User with this email already exists", 409);
  }

  const hashedPassword = await hashPassword(parsedInput.password);

  const createdUser = (await prisma.user.create({
    data: {
      name: parsedInput.name,
      email: parsedInput.email,
      passwordHash: hashedPassword,
    } as never,
  })) as unknown as UserWithPassword;

  if (!createdUser.passwordHash) {
    throw new AuthServiceError(
      "User passwordHash is missing. Add passwordHash field to Prisma User model.",
      500,
    );
  }

  const token = signJwtToken({
    userId: createdUser.id,
    email: createdUser.email,
    role: createdUser.role,
  });

  return {
    user: sanitizeUser(createdUser),
    token,
    cookie: generateAuthCookie(token),
  };
};

export const loginUser = async (input: unknown): Promise<AuthResult> => {
  const parsedInput = validateCredentials("login", input);

  const user = (await prisma.user.findUnique({
    where: { email: parsedInput.email },
  })) as UserWithPassword | null;

  if (!user || !user.passwordHash) {
    throw new AuthServiceError("Invalid email or password", 401);
  }

  const isPasswordValid = await comparePassword(parsedInput.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AuthServiceError("Invalid email or password", 401);
  }

  const token = signJwtToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: sanitizeUser(user),
    token,
    cookie: generateAuthCookie(token),
  };
};

export const getUserById = async (userId: string): Promise<SafeUser | null> => {
  const user = (await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  })) as SafeUser | null;
  return user;
};
