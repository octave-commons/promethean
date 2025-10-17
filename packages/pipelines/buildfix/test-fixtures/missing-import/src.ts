interface User {
  id: number;
  name: string;
}

export function processUser(user: User) {
  return user.id;
}