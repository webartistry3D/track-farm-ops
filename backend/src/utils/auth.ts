import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

interface TokenPayloadSource {
  id: number;
  email: string;
  role: string;
  name: string;
  organizationId?: number | null;
}

export const generateToken = (user: TokenPayloadSource): string => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name,
      organizationId: user.organizationId
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
