import blocklist from "./blocklist";
import repos from "./repos";
import getAllCommits from "./utils/get-commits";

// Fetch headers
const headers = {
  Authorization: `token ${process.env.TOKEN}`,
};

/// Get total, commit and issue count inside an organization or a user (username)
async function getCountBasedOnOrg(
  commitCount: { [key: string]: number },
  issueCount: { [key: string]: number },
  userDetails: { [key: string]: { userId: number; username: string } },
) {
  // Calculate for the first of every year
  const currentDate = new Date().getFullYear();
  const countStartDate = new Date(`${currentDate}-01-01`);

  for (const repo of repos) {
    const allCommits = await getAllCommits(repo, countStartDate);
    for (const commit of allCommits) {
      const author = commit.author;
      if (blocklist.includes(author.login)) {
        return;
      }

      if (author) {
        const authorName = author.login;
        const userId = author.id;
        if (!userDetails[authorName]) {
          userDetails[authorName] = { userId, username: authorName };
        }

        commitCount[authorName] = (commitCount[authorName] || 0) + 1;
      }
    }

    // Fetch issues for the repo
    const issueRes = await fetch(
      `https://api.github.com/repos/${repo}/issues?since=${countStartDate.toISOString()}&per_page=5000`,
      { headers },
    );
    const issueData = await issueRes.json();

    // Update the issue count
    if (issueRes.status === 200) {
      for (const issue of issueData) {
        const user = issue.user;
        const userName = user.login;

        if (blocklist.includes(userName)) {
          return;
        }

        const userId = user.id;
        if (!userDetails[userName]) {
          userDetails[userName] = { userId, username: userName };
        }

        issueCount[userName] = (issueCount[userName] || 0) + 1;
      }
    }
  }
}

async function run() {
  let commitCount: Record<string, number> = {};
  let issueCount: Record<string, number> = {};
  let userDetails: Record<string, { userId: number; username: string }> = {};

  await getCountBasedOnOrg(commitCount, issueCount, userDetails);

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
