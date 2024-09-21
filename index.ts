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

// TODO: add pagination
const server = Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(_req) {
    const dataFile = Bun.file("data.json", { type: "application/json" });
    const dataString = await dataFile.text();
    const data: any[] = JSON.parse(dataString);

    const res = {
      success: true,
      message: "Success",
      data: {
        docs: data,
        totalDocs: data.length,
        limit: data.length,
        page: 1,
        totalPages: 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      },
    };

    return new Response(JSON.stringify(res), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
    });
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);
