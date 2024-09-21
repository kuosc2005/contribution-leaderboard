// Fetch headers
const headers = {
  Authorization: `token ${process.env.TOKEN}`,
};

/// Get total, commit and issue count inside an organization or a user (username)
async function getCountBasedOnOrg(
  orgName: string,
  commitCount: { [key: string]: number },
  issueCount: { [key: string]: number },
  userDetails: { [key: string]: { userId: number; username: string } },
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
        for (const commit of data) {
          const author = commit.author;
          if (author) {
            const authorName = author.login;
            const userId = author.id;
            if (!userDetails[authorName]) {
              userDetails[authorName] = { userId, username: authorName };
            }

            commitCount[authorName] = (commitCount[authorName] || 0) + 1;
          }
        }
      }

      // Fetch issues for the repo
      const issueRes = await fetch(
        `https://api.github.com/repos/${orgName}/${repo}/issues?since=${countStartDate.toISOString()}`,
        { headers },
      );
      const issueData = await issueRes.json();

      // Update the issue count
      if (issueRes.status === 200) {
        for (const issue of issueData) {
          const user = issue.user;
          const userName = user.login;
          const userId = user.id;
          if (!userDetails[userName]) {
            userDetails[userName] = { userId, username: userName };
          }

          issueCount[userName] = (issueCount[userName] || 0) + 1;
        }
      }
    }
  }
}

async function run() {
  const orgs = ["kucc1997", "kuosc2005"];

  let commitCount: Record<string, number> = {};
  let issueCount: Record<string, number> = {};
  let userDetails: Record<string, { userId: number; username: string }> = {};

  for (const org of orgs) {
    await getCountBasedOnOrg(org, commitCount, issueCount, userDetails);
  }

  let totalCount: Record<string, number> = { ...commitCount };
  for (const [key, value] of Object.entries(issueCount)) {
    if (commitCount[key]) {
      totalCount[key] += value;
    } else {
      totalCount[key] = value;
    }
  }

  const result = Object.entries(totalCount)
    .map(([username, total]) => {
      const types = [];
      if (commitCount[username]) {
        types.push({
          type: "commit",
          count: commitCount[username],
        });
      }
      if (issueCount[username]) {
        types.push({
          type: "issue",
          count: issueCount[username],
        });
      }

      return {
        _id: {
          userId: userDetails[username].userId,
          username: userDetails[username].username,
        },
        types,
        total,
      };
    })
    .sort((a, b) => b.total - a.total);

  return result;
}

export default run;
