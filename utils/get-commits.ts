/// Returns all commits from a given repository since a given date
/// @param repo - The repository to fetch commits from
/// @param countStartDate - The date to start counting commits from
async function getAllCommits(repo: string, countStartDate: Date) {
  let allCommits: any[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const url = `https://api.github.com/repos/${repo}/commits?since=${countStartDate.toISOString()}&per_page=100&page=${page}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `token ${process.env.TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch commits: ${response.statusText}`);
    }

    const commits = await response.json();
    allCommits = allCommits.concat(commits);

    // Check if there is a next page by looking at the 'Link' header
    const linkHeader = response.headers.get("link");
    if (linkHeader && linkHeader.includes('rel="next"')) {
      page += 1;
    } else {
      hasNextPage = false;
    }
  }

  return allCommits;
}

export default getAllCommits;
