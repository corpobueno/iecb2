import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface jwtData {
  username: string;
  companyId: number;
}

export class AuthService {

  static compareValues(body: any, user: any): boolean {    
    // Compara usuario com username
    const usuarioIgual = body.usuario === user.username;
    
    // Compara empresa com companyId
    const empresaIgual = body.empresa === user.companyId;
    
    // Compara grupo com groupId
    const grupoIgual = body.grupo === user.groupId;
    
    return usuarioIgual && empresaIgual && grupoIgual;
}
  
static generateToken(username: string, companyId: number, groupId: number): string {
  if (!process.env.JWT_SECRET) return 'JWT_SECRET_NOT_FOUND';

  // Milissegundos até a meia-noite
  const msToMidnight = new Date().setHours(24, 0, 0, 0) - Date.now();

  return jwt.sign(
    { username, companyId, groupId },
    process.env.JWT_SECRET,
    { expiresIn: `${msToMidnight}ms` }
  );
}

  static verifyToken(token: string): boolean {
    const secret = process.env.JWT_SECRET || 'defaultSecret';
    try {
      jwt.verify(token, secret);
      return true;
    } catch {
      return false;
    }
  }

  static decodeToken(token: string): jwtData | 'JWT_SECRET_NOT_FOUND' | 'INVALID_TOKEN' {

    if (!process.env.JWT_SECRET) return 'JWT_SECRET_NOT_FOUND';
  
      try {
        
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
         
          if (typeof decoded === 'string') {
              return 'INVALID_TOKEN';
          }
  
          return decoded as jwtData;
      } catch (error) {
          return 'INVALID_TOKEN';
      }
  }

  static hashPassword(password: string): string {
    return crypto.createHash('md5').update(password).digest('hex');
  }

  static comparePasswords(inputPassword: string, hashedPassword: string): boolean {
    return AuthService.hashPassword(inputPassword) === hashedPassword;
  }
}
