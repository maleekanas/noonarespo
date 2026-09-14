import bcrypt from "bcryptjs";
import { PrismaClient, RoleType, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

export interface AuthenticatedIdentity {
  id: string;
  email: string;
  role: RoleType;
  locale: string;
}

export async function authenticateCredentials(
  email: string,
  password: string
): Promise<AuthenticatedIdentity | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) return null;

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { userRoles: { include: { role: true } } },
  });

  if (!user || user.status !== UserStatus.ACTIVE) return null;
  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) return null;

  const role = user.userRoles[0]?.role.name;
  if (!role) return null;

  return {
    id: user.id,
    email: user.email,
    role,
    locale: user.localePreference,
  };
}
