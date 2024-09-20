import cron from "node-cron";
import run from "./count-contributors";

// Schedule of u
cron.schedule("0 0 * * *", async () => {
	console.log("Started counting");
	const { totalCount, commitCount, issueCount } = await run();

	console.log("Writing to files...");

	await Bun.write("data/total-count.json", JSON.stringify(totalCount));
	await Bun.write("data/commit-count.json", JSON.stringify(commitCount));
	await Bun.write("data/issue-count.json", JSON.stringify(issueCount));

	console.log("Ended counting");
});

const server = Bun.serve({
	port: process.env.PORT || 3000,
	fetch(_req) {
		return new Response("Bun!");
	},
});

console.log(`Listening on http://localhost:${server.port} ...`);
