---
difficulty: easy
scale: small
complexity: low
answer: |
  The agent should identify:
1. Missing type annotations for function parameters
2. Use of 'any' type that should be more specific
3. Missing return type annotations
4. Potential null/undefined issues
5. Interface vs type usage inconsistencies
---

Review this TypeScript code for type safety issues and suggest improvements:

```typescript
function processUserData(data: any) {
  const result = {
    id: data.id,
    name: data.firstName + ' ' + data.lastName,
    email: data.emailAddress,
    age: data.age
  };
  
  return result;
}

function validateUser(user) {
  if (user.age < 18) {
    return false;
  }
  return true;
}

const userData = processUserData({
  id: '123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  age: 25
});

console.log(userData.name);
```

Identify all type safety issues and provide a refactored version with proper TypeScript types.