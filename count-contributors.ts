import cron from "node-cron";

// Fetch headers
const headers = {
	Authorization: `token ${process.env.TOKEN}`,
};

/// Get total, commit and issue count inside an organization or a user (username)
async function getCountBasedOnOrg(
	orgName: string,
	commitCount: { [key: string]: number },
	issueCount: { [key: string]: number },
) {
	// Calculate for the first of every year
	const currentDate = new Date().getFullYear();
	const countStartDate = new Date(`${currentDate}-01-01`);

	// Fetch the repositories of the organization or the user
	const res = await fetch(
		`https://api.github.com/orgs/${orgName}/repos?per_page=100`,
		{ headers },
	);
	const data = await res.json();
	const repos: string[] = data.map((item: any) => item.name);

	for (const repo of repos) {
		if (!repo.includes("scrapemore") && repo !== "it-meet") {
			// Fetch commits for the repo
			const res = await fetch(
				`https://api.github.com/repos/${orgName}/${repo}/commits?since=${countStartDate.toISOString()}&per_page=500`,
				{ headers },
			);
			const data = await res.json();

			// Update the commit count
			if (res.status === 200) {
				data.forEach((commit: any) => {
					const authorName = commit.author.login;
					if (commitCount[authorName]) {
						commitCount[authorName]++;
					} else {
						commitCount[authorName] = 1;
					}
				});
			}

			// Fetch issues for the repo
			const issueRes = await fetch(
				`https://api.github.com/repos/${orgName}/${repo}/issues?since=${countStartDate.toISOString()}`,
				{ headers },
			);
			const issueData = await issueRes.json();

			// Update the issue count
			if (issueRes.status === 200) {
				issueData.forEach((issue: any) => {
					const userLogin = issue.user.login;
					if (issueCount[userLogin]) {
						issueCount[userLogin]++;
					} else {
						issueCount[userLogin] = 1;
					}
				});
			}
		}
	}
}

async function run() {
	const orgs = ["kucc1997", "kuosc2005"];

	let commitCount: Record<string, number> = {};
	let issueCount: Record<string, number> = {};

	for (const org of orgs) {
		await getCountBasedOnOrg(org, commitCount, issueCount);
	}

	let totalCount: Record<string, number> = { ...commitCount };
	for (const [key, value] of Object.entries(issueCount)) {
		if (commitCount[key]) {
			totalCount[key] += value;
		} else {
			totalCount[key] = value;
		}
	}
	totalCount = Object.entries(totalCount)
		.sort(([, countA], [, countB]) => countB - countA)
		.reduce(
			(acc, [user, count]) => {
				acc[user] = count;
				return acc;
			},
			{} as Record<string, number>,
		);

	return { totalCount, commitCount, issueCount };
}

export default run;

cron.schedule("* * * * *", async () => {
	console.log("Starting...");
	const { totalCount, commitCount, issueCount } = await run();

	await Bun.write("data/total-count.json", JSON.stringify(totalCount));
	await Bun.write("data/commit-count.json", JSON.stringify(commitCount));
	await Bun.write("data/issue-count.json", JSON.stringify(issueCount));

	console.log("Ended");
});
