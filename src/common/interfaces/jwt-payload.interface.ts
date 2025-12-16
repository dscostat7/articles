export interface JwtPayload {
  sub: number;
  email: string;
  permission: string;
  iat?: number;
  exp?: number;
}
