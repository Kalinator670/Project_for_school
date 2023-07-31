export interface IUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGenericResponse {
  status: string;
  message: string;
}

export interface IUserState {
  user: IUser | null;
  token: string | null;
}
