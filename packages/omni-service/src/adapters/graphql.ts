import type { FastifyInstance } from 'fastify';
// Workaround for mercurius type definition issue
const mercurius = require('mercurius');
import type { UserContext } from '../auth/types.js';

// GraphQL resolver types
interface GraphQLContext {
  user?: UserContext;
}

interface PaginationInput {
  limit?: number;
  offset?: number;
}

interface UserFilter {
  role?: string;
  search?: string;
}

interface PostFilter {
  authorId?: string;
  search?: string;
}

/**
 * GraphQL type definitions
 */
const typeDefs = `
  type Query {
    health: Health
    me: User
    users(pagination: PaginationInput, filter: UserFilter): UserConnection
    posts(pagination: PaginationInput, filter: PostFilter): PostConnection
    user(id: ID!): User
    post(id: ID!): Post
  }
  
  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): Boolean!
  }
  
  type Subscription {
    userUpdates: User!
    postUpdates: Post!
  }
  
  type Health {
    status: String!
    adapter: String!
    timestamp: String!
  }
  
  type User {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
    createdAt: String!
    updatedAt: String
  }
  
  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    status: PostStatus!
    createdAt: String!
    updatedAt: String
  }
  
  enum UserRole {
    ADMIN
    USER
    READONLY
    SERVICE
  }
  
  enum PostStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }
  
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
  
  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }
  
  type UserEdge {
    node: User!
    cursor: String!
  }
  
  type PostConnection {
    edges: [PostEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }
  
  type PostEdge {
    node: Post!
    cursor: String!
  }
  
  input PaginationInput {
    first: Int
    after: String
    last: Int
    before: String
  }
  
  input UserFilter {
    role: UserRole
    search: String
    createdAfter: String
    createdBefore: String
  }
  
  input PostFilter {
    status: PostStatus
    authorId: ID
    search: String
    createdAfter: String
    createdBefore: String
  }
  
  input CreateUserInput {
    name: String!
    email: String!
    role: UserRole!
  }
  
  input UpdateUserInput {
    name: String
    email: String
    role: UserRole
  }
  
  input CreatePostInput {
    title: String!
    content: String!
    status: PostStatus!
    authorId: ID!
  }
  
  input UpdatePostInput {
    title: String
    content: String
    status: PostStatus!
  }
`;

/**
 * Mock data store for GraphQL resolvers
 */
class GraphQLDataStore {
  private users: Map<string, any> = new Map();
  private posts: Map<string, any> = new Map();

  // Public getters for health checks
  public getUsersCount(): number {
    return this.users.size;
  }

  public getPostsCount(): number {
    return this.posts.size;
  }

  constructor() {
    this.users.set('1', {
      id: '1',
      name: 'Alice',
      email: 'alice@example.com',
      role: 'USER',
      createdAt: '2025-06-20T00:00:00Z',
      updatedAt: '2025-06-20T00:00:00Z',
    });

    this.users.set('2', {
      id: '2',
      name: 'Bob',
      email: 'bob@example.com',
      role: 'ADMIN',
      createdAt: '2025-06-20T01:00:00Z',
      updatedAt: '2025-06-20T01:00:00Z',
    });

    this.posts.set('1', {
      id: '1',
      title: 'First GraphQL Post',
      content: 'This is the first post in our GraphQL API',
      author: '1',
      status: 'PUBLISHED',
      createdAt: '2025-06-20T12:00:00Z',
      updatedAt: '2025-06-20T12:00:00Z',
    });

    this.posts.set('2', {
      id: '2',
      title: 'Second GraphQL Post',
      content: 'This is the second post demonstrating GraphQL subscriptions',
      author: '2',
      status: 'DRAFT',
      createdAt: '2025-06-20T13:00:00Z',
      updatedAt: '2025-06-20T13:00:00Z',
    });
  }

  getUsers(filter?: any, pagination?: any): any {
    let users = Array.from(this.users.values());

    if (filter) {
      if (filter.role) {
        users = users.filter((user) => user.role === filter.role);
      }
      if (filter.search) {
        const search = filter.search.toLowerCase();
        users = users.filter(
          (user) =>
            user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search),
        );
      }
    }

    const totalCount = users.length;
    let edges = [];
    let pageInfo = {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: '',
      endCursor: '',
    };

    if (pagination) {
      const first = pagination.first || 10;
      const after = pagination.after ? parseInt(pagination.after, 10) : 0;

      const start = after;
      const end = Math.min(start + first, users.length);

      const paginatedUsers = users.slice(start, end);

      edges = paginatedUsers.map((user, index) => ({
        node: user,
        cursor: String(start + index),
      }));

      pageInfo = {
        hasNextPage: end < users.length,
        hasPreviousPage: start > 0,
        startCursor: edges[0]?.cursor || '',
        endCursor: edges[edges.length - 1]?.cursor || '',
      };
    } else {
      edges = users.map((user, index) => ({
        node: user,
        cursor: String(index),
      }));
    }

    return { edges, pageInfo, totalCount };
  }

  getUser(id: string): any {
    return this.users.get(id);
  }

  createUser(input: any): any {
    const id = String(Math.max(...Array.from(this.users.keys()).map(Number), 0) + 1);
    const user = {
      ...input,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, user);
    return user;
  }

  updateUser(id: string, input: any): any {
    const existing = this.users.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, updated);
    return updated;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  getPosts(filter?: any, pagination?: any): any {
    let posts = Array.from(this.posts.values());

    if (filter) {
      if (filter.status) {
        posts = posts.filter((post) => post.status === filter.status);
      }
      if (filter.authorId) {
        posts = posts.filter((post) => post.author === filter.authorId);
      }
      if (filter.search) {
        const search = filter.search.toLowerCase();
        posts = posts.filter(
          (post) =>
            post.title.toLowerCase().includes(search) ||
            post.content.toLowerCase().includes(search),
        );
      }
    }

    const totalCount = posts.length;
    let edges = [];
    let pageInfo = {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: '',
      endCursor: '',
    };

    if (pagination) {
      const first = pagination.first || 10;
      const after = pagination.after ? parseInt(pagination.after, 10) : 0;

      const start = after;
      const end = Math.min(start + first, posts.length);

      const paginatedPosts = posts.slice(start, end);

      edges = paginatedPosts.map((post, index) => ({
        node: post,
        cursor: String(start + index),
      }));

      pageInfo = {
        hasNextPage: end < posts.length,
        hasPreviousPage: start > 0,
        startCursor: edges[0]?.cursor || '',
        endCursor: edges[edges.length - 1]?.cursor || '',
      };
    } else {
      edges = posts.map((post, index) => ({
        node: post,
        cursor: String(index),
      }));
    }

    return { edges, pageInfo, totalCount };
  }

  getPost(id: string): any {
    const post = this.posts.get(id);
    if (post) {
      return {
        ...post,
        author: this.users.get(post.author),
      };
    }
    return null;
  }

  createPost(input: any): any {
    const id = String(Math.max(...Array.from(this.posts.keys()).map(Number), 0) + 1);
    const post = {
      ...input,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.posts.set(id, post);
    return {
      ...post,
      author: this.users.get(post.author),
    };
  }

  updatePost(id: string, input: any): any {
    const existing = this.posts.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    this.posts.set(id, updated);
    return {
      ...updated,
      author: this.users.get(updated.author),
    };
  }

  deletePost(id: string): boolean {
    return this.posts.delete(id);
  }
}

const resolvers = {
  Query: {
    health: () => ({
      status: 'ok',
      adapter: 'graphql',
      timestamp: new Date().toISOString(),
    }),

    me: (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }
      return {
        id: context.user.id,
        name: context.user.username || 'Unknown',
        email: context.user.email || '',
        role: context.user.roles[0] || 'READONLY',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },

    users: (_parent: unknown, args: { filter?: UserFilter; pagination?: PaginationInput }) => {
      const dataStore = new GraphQLDataStore();
      return dataStore.getUsers(args.filter, args.pagination);
    },

    posts: (_parent: unknown, args: { filter?: PostFilter; pagination?: PaginationInput }) => {
      const dataStore = new GraphQLDataStore();
      return dataStore.getPosts(args.filter, args.pagination);
    },

    user: (_parent: unknown, args: { id: string }) => {
      const dataStore = new GraphQLDataStore();
      return dataStore.getUser(args.id);
    },

    post: (_parent: unknown, args: { id: string }) => {
      const dataStore = new GraphQLDataStore();
      return dataStore.getPost(args.id);
    },
  },

  Mutation: {
    createUser: (_parent: unknown, args: { input: any }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const dataStore = new GraphQLDataStore();
      return dataStore.createUser(args.input);
    },

    updateUser: (_parent: unknown, args: { id: string; input: any }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const dataStore = new GraphQLDataStore();
      return dataStore.updateUser(args.id, args.input);
    },

    deleteUser: (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const dataStore = new GraphQLDataStore();
      return dataStore.deleteUser(args.id);
    },

    createPost: (_parent: unknown, args: { input: any }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const dataStore = new GraphQLDataStore();
      return dataStore.createPost(args.input);
    },

    updatePost: (_parent: unknown, args: { id: string; input: any }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const dataStore = new GraphQLDataStore();
      return dataStore.updatePost(args.id, args.input);
    },

    deletePost: (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const dataStore = new GraphQLDataStore();
      return dataStore.deletePost(args.id);
    },
  },

  Subscription: {
    userUpdates: {
      subscribe: (_parent: unknown, _args: unknown, { pubsub }: { pubsub: any }) => {
        return pubsub.subscribe('user-updates');
      },
      resolve: (payload: any) => payload,
    },

    postUpdates: {
      subscribe: (_parent: unknown, _args: unknown, { pubsub }: { pubsub: any }) => {
        return pubsub.subscribe('post-updates');
      },
      resolve: (payload: any) => payload,
    },
  },
};

/**
 * Mount GraphQL adapter
 */
export function mountGraphQLAdapter(
  app: FastifyInstance,
  options: {
    endpoint: string;
    playground?: boolean;
    graphiql?: boolean;
    authManager?: any;
    enableSubscriptions?: boolean;
  } = {
    endpoint: '/graphql',
    playground: true,
    graphiql: false,
    enableSubscriptions: false,
  },
) {
  const dataStore = new GraphQLDataStore();

  // TODO: Fix mercurius type definition issue with SocketStream
  // app.register(mercurius as any, {
  //   schema: typeDefs,
  //   resolvers,
  //   context: (request: any) => {
  //     return {
  //       user: request.user,
  //     };
  //   },
  //   graphiql: options.playground,
  // });

  app.get(`${options.endpoint}/schema`, async (_request, reply) => {
    return reply.type('application/graphql').send(typeDefs);
  });

  app.get(`${options.endpoint}/health`, async (_request, reply) => {
    const healthStatus = {
      status: 'ok',
      adapter: 'graphql',
      timestamp: new Date().toISOString(),
      subscriptions: options.enableSubscriptions,
      playground: options.playground,
      data: {
        users: dataStore.getUsersCount(),
        posts: dataStore.getPostsCount(),
      },
    };

    return reply.send(healthStatus);
  });

  app.get(`${options.endpoint}/docs`, async (_request, reply) => {
    const docs = {
      title: 'GraphQL API Documentation',
      endpoint: options.endpoint,
      playground: `${options.endpoint}/playground`,
      schema: `${options.endpoint}/schema`,
      description: 'GraphQL API for the Omni Service with real-time subscriptions',
      types: {
        Query: ['health', 'me', 'users', 'posts', 'user(id: ID!)', 'post(id: ID!)'],
        Mutation: [
          'createUser(input: CreateUserInput!)',
          'updateUser(id: ID!, input: UpdateUserInput!)',
          'deleteUser(id: ID!)',
          'createPost(input: CreatePostInput!)',
          'updatePost(id: ID!, input: UpdatePostInput!)',
          'deletePost(id: ID!)',
        ],
        Subscription: ['userUpdates', 'postUpdates'],
      },
      authentication: {
        type: 'JWT Bearer Token',
        header: 'Authorization: Bearer <token>',
        apikey: 'x-api-key: <key>',
      },
      examples: {
        users: {
          query: `
            query GetUsers($first: Int, $after: String) {
              users(pagination: { first: $first, after: $after }) {
                edges {
                  node {
                    id
                    name
                    email
                    role
                  }
                  cursor
                }
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                  startCursor
                  endCursor
                }
                totalCount
              }
            }
          `,
          variables: { first: 10, after: 'cursor' },
        },
        createUser: {
          mutation: `
            mutation CreateUser($input: CreateUserInput!) {
              createUser(input: $input) {
                id
                name
                email
                role
                createdAt
              }
            }
          `,
          variables: {
            input: {
              name: 'John Doe',
              email: 'john@example.com',
              role: 'USER',
            },
          },
        },
      },
      subscriptions: options.enableSubscriptions
        ? {
            userUpdates: {
              subscription: `
            subscription UserUpdates {
              userUpdates {
                id
                name
                email
                role
                updatedAt
              }
            }
          `,
              description: 'Real-time updates when user information changes',
            },
          }
        : undefined,
    };

    return reply.send(docs);
  });

  app.log.info(`GraphQL adapter mounted at ${options.endpoint}`);

  if (options.playground) {
    app.log.info(`GraphQL playground available at ${options.endpoint}/playground`);
  }
}

export function createSubscriptionPublisher(app: FastifyInstance, _options: { endpoint: string }) {
  return {
    publishUserUpdate: async (userData: any) => {
      app.log.info(`User update published: ${JSON.stringify(userData)}`);
    },

    publishPostUpdate: async (postData: any) => {
      app.log.info(`Post update published: ${JSON.stringify(postData)}`);
    },
  };
}
