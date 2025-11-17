export interface Users {
  id: number;
  username: string;
  password: string;
  role?: 'admin' | 'player';
}
