export function processUser(user: User) {
  return user.id;
}

export interface User {
  id: number;
  name: string;
}