import Redis from "ioredis";

/*const redisOptions = {
  host: "127.0.0.1",
  port: 6379,
};*/

//const client = new Redis("rediss://default:AcffAAIjcDEzMGQ1OGRhNmJkZWU0MTE5OGM3NTI0MzkxYWI3YTkzNHAxMA@outgoing-colt-51167.upstash.io:6379");

const publisher = new Redis("rediss://default:AcffAAIjcDEzMGQ1OGRhNmJkZWU0MTE5OGM3NTI0MzkxYWI3YTkzNHAxMA@outgoing-colt-51167.upstash.io:6379");
const subscriber = new Redis("rediss://default:AcffAAIjcDEzMGQ1OGRhNmJkZWU0MTE5OGM3NTI0MzkxYWI3YTkzNHAxMA@outgoing-colt-51167.upstash.io:6379");

[publisher, subscriber].forEach((client, index) => {
    const type = index === 0 ? "Publisher" : "Subscriber";
  
    client.on("connect", () => {
      console.log(`${type} connected to Redis`);
    });
  
    client.on("error", (err) => {
      console.error(`${type} Redis error:`, err);
    });
});
  
export { publisher, subscriber };