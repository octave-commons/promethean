// ERROR: Property does not exist on object
// ERROR_CODE: TS2339
interface User {
  name: string;
}

export function getUserProperty(user: User) {
  return user.missingProp;
}