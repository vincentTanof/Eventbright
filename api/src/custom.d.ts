export interface User {
  id: number; // Ensure the id field is present
  fullname: string;
  email: string;
  role: string;
}


declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}
