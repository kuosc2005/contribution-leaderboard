import run from "./count-contributors";

console.log("Started counting");
const data = await run();

console.log("Writing to files...");
await Bun.write("data.json", JSON.stringify(data));

console.log("Ended counting");
