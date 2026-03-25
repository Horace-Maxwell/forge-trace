interface PullRequestImport {
  prNumber: number;
  title: string;
  comments: string[];
  reviews: string[];
}

export async function fetchPullRequest(repo: string, prNumber: number, token: string): Promise<PullRequestImport> {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const [prResponse, issueCommentsResponse, reviewResponse] = await Promise.all([
    fetch(`https://api.github.com/repos/${repo}/pulls/${prNumber}`, { headers }),
    fetch(`https://api.github.com/repos/${repo}/issues/${prNumber}/comments`, { headers }),
    fetch(`https://api.github.com/repos/${repo}/pulls/${prNumber}/reviews`, { headers }),
  ]);

  if (!prResponse.ok || !issueCommentsResponse.ok || !reviewResponse.ok) {
    throw new Error("Failed to import pull request data from GitHub.");
  }

  const pr = (await prResponse.json()) as { title: string };
  const comments = (await issueCommentsResponse.json()) as Array<{ body?: string }>;
  const reviews = (await reviewResponse.json()) as Array<{ body?: string; state?: string }>;

  return {
    prNumber,
    title: pr.title,
    comments: comments.map((comment) => comment.body ?? "").filter(Boolean),
    reviews: reviews.map((review) => `${review.state ?? "COMMENTED"}: ${review.body ?? ""}`.trim()).filter(Boolean),
  };
}
