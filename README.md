# Contribution Leaderboard

It is the leaderboard of the contributors of KUOSC and KUCC open source projects.

## To install dependencies:

```bash
bun install
```

## To run:

Make sure to add GitHub token as your environment variable. Please check `.env.example`.

For the first time usage, please fetch the data. To fetch the data,

```
bun fetch
```

When you serve, the contributions are fetch once a day. To serve, run

```bash
bun serve
```

## API

This API accepts any route as long as it's a GET request.

### Request Format

```
GET /{any_route}
```

### Response Format

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "docs": [
      {
        "_id": {
          "userId": 96732471,
          "username": "abhiyandhakal"
        },
        "types": [
          {
            "type": "commit",
            "count": 38
          },
          {
            "type": "issue",
            "count": 6
          }
        ],
        "total": 44
      }
    ],
    "totalDocs": 22,
    "limit": 22,
    "page": 1,
    "totalPages": 1,
    "pagingCounter": 1,
    "hasPrevPage": false,
    "hasNextPage": false,
    "prevPage": null,
    "nextPage": null
  }
}
```

<hr>

This project was created using `bun init` in bun v1.1.0. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
