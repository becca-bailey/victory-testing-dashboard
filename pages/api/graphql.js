import {ApolloServer, gql} from "apollo-server-micro";
import hobbiesData from "../../public/hobbies-json.json";

const typeDefs = gql`
  type PopularityByWeek {
    week: String!
    popularity: Int!
  }

  type HobbyPopularity {
    hobby: String!
    values: [PopularityByWeek!]!
  }

  type Query {
    hobbyGooglePopularity: [HobbyPopularity!]!
  }
`;

const resolvers = {
  Query: {
    hobbyGooglePopularity: () => {
      return Object.entries(hobbiesData).map(([hobby, values]) => {
        return {hobby, values};
      });
    },
  },
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const startServer = apolloServer.start();

// https://stackoverflow.com/questions/68745267/apollo-server-micro-response-is-missing-header-access-control-allow-methods-p
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://studio.apollographql.com"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Allow-Credentials, Access-Control-Allow-Headers"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, PATCH, DELETE, OPTIONS, HEAD"
  );
  if (req.method === "OPTIONS") {
    res.end();
    return false;
  }

  await startServer;
  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
}
