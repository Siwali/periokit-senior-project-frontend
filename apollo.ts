import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'

// เชื่อมต่อกับ GraphQL API ของคุณ
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
})

// สร้าง cache instance
const cache = new InMemoryCache()

// สร้าง Apollo Client
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
})