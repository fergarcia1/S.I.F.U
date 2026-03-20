export interface Users {
  id: string;
  username: string;
  password: string;
  role?: 'admin' | 'player';
}
