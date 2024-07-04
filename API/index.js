require("dotenv").config();
const cors = require("cors");
const { createServer } = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const { ApolloServer } = require("apollo-server-express");
const { resolvers, graphqlSchema } = require("./server/schema");
const { connect_to_db } = require("./server/db");
const { execute, subscribe } = require("graphql");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { SubscriptionServer } = require("subscriptions-transport-ws");

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

const port = process.env.API_SERVER_PORT;

const osu = require("node-os-utils");
const cpu = osu.cpu;
var mem = osu.mem

mem.info()
  .then(info => {
    console.log(info)
  })
// Function to log CPU usage
const logCPUUsage = () => {
    cpu.usage().then((cpuPercentage) => {
        console.log('CPU Usage:', cpuPercentage.toFixed(2) + '%');
    });
};

// Run the function every 5 seconds
setInterval(logCPUUsage, 5000);


const schema = makeExecutableSchema({ typeDefs: graphqlSchema, resolvers });

const httpServer = createServer(app);

const server = new ApolloServer({
  schema,
  formatError: (error) => {
    console.log(error);
    return error;
  },
  context: async ({ req }) => {
    try {
      const headers = req.headers;
      return headers;
    } catch (error) {
      return error;
    }
  },
});

server.start().then(async () => {
  server.applyMiddleware({ app, path: "/graphql" });
  await connect_to_db();

  httpServer.listen({ port }, () => {
    console.log(
      `🚀 Server running at http://localhost:${port + server.graphqlPath}`
    );

    // Create WebSocket server for subscriptions
    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
      },
      {
        server: httpServer,
        path: "/graphql",
      }
    );
  });
});
