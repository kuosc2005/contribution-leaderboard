import cron from "node-cron";
import run from "./count-contributors";

// Schedule of counting contributions every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Started counting");
  const data = await run();

  console.log("Writing to files...");
  await Bun.write("data.json", JSON.stringify(data));

  console.log("Ended counting");
});

const server = Bun.serve({
  port: process.env.PORT || 3000,
  fetch(_req) {
    return new Response("Bun!");
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);
