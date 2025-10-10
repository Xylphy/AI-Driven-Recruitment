import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// const client = new ApolloClient({
//   link: new HttpLink({
//     uri:
//       process.env.NEXT_PUBLIC_GRAPHQL_API_URL ||
//       "http://localhost:3000/api/graphql",
//     credentials: "include",
//   }),
//   cache: new InMemoryCache(),
// });

const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://flyby-router-demo.herokuapp.com/",
  }),
  cache: new InMemoryCache(),
});

export default client;
