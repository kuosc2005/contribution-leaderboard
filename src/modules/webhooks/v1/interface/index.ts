export interface IWebhook {
  username: string;
  userId: number;
  type: "commit" | "issue";
  repositoryId: number;
  repositoryName: string;
}

export interface IPost {
  payload: string;
}

export interface IPayload {
  repository: {
    id: number;
    full_name: string;
  };
  issue: {
    user: {
      login: string;
      id: number;
    };
  };
  commits: [
    {
      id: string;
      author: {
        name: string;
        username: string;
        email: string;
      };
    }
  ];
}

export interface IGetQuery {
  type: "commit" | "issue";
  limit: number;
  page: number;
  from: Date;
  to: Date;
}
