import type { User } from "@prisma/client";
import { prisma } from "./db";


export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function getUserByEmailOrName(params: {
  email?: string | null;
  name?: string;
}): Promise<User | null> {
  const { email, name } = params;

  if (email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  if (name) {
    return prisma.user.findFirst({
      where: { name },
    });
  }

  return null;
}

export async function createUser(data: {
  name: string;
  email?: string | null;
  role?: "ADMIN" | "USER";
}): Promise<User> {
  const { name, email, role } = data;

  return prisma.user.create({
    data: {
      name,
      email: email ?? null,
      role: role ?? "USER",
    },
  });
}

export async function countUsers(): Promise<number> {
  return prisma.user.count();
}

