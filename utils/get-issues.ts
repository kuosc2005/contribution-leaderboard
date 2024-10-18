/// Returns all commits from a given repository since a given date
/// @param repo - The repository to fetch commits from
/// @param countStartDate - The date to start counting commits from
async function getAllIssues(repo: string, countStartDate: Date) {
  let allIssues: any[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const url = `https://api.github.com/repos/${repo}/issues?per_page=100&page=${page}&since=${countStartDate.toISOString()}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `token ${process.env.TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch issues: ${response.statusText}`);
    }

    const issues = await response.json();
    allIssues = allIssues.concat(issues);

    // Check if there is a next page by looking at the 'Link' header
    const linkHeader = response.headers.get("link");
    if (linkHeader && linkHeader.includes('rel="next"')) {
      page += 1;
    } else {
      hasNextPage = false;
    }
  }

  return allIssues;
}

export default getAllIssues;
