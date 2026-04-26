# Social Listening Draft Agent

This agent collects relevant Reddit posts and generates approval-ready comment drafts.
It does not auto-post.

## Why this design

- Keeps account risk lower by avoiding automated posting.
- Lets you review each draft for subreddit rules and tone.
- Produces repeatable output files that can be used by your team.

## Command

```bash
npm run social:reddit:drafts
```

## Output files

- reports/social/reddit-drafts.latest.json
- reports/social/reddit-drafts.YYYY-MM-DD.json

Each candidate includes:

- Reddit permalink
- relevance score and reasons
- suggested link
- suggested reply text
- priority: high or medium

## Environment variables

Optional variables:

- SITE_URL: defaults to https://termintacho.de
- REDDIT_SUBREDDITS: comma-separated list
- REDDIT_QUERIES: comma-separated list
- REDDIT_LIMIT_PER_QUERY: defaults to 10
- SOCIAL_MAX_DRAFTS: defaults to 80

Example:

```bash
REDDIT_SUBREDDITS=germany,berlin,expats REDDIT_QUERIES="blue card timeline,residence permit waiting" npm run social:reddit:drafts
```

## Review workflow

1. Run the command.
2. Open reports/social/reddit-drafts.latest.json.
3. Check each candidate against subreddit rules.
4. Edit comment text manually before posting.
5. Post only where your response clearly adds value.

## Facebook note

Facebook data should be accessed through the Graph API with proper app permissions.
Do not scrape personal profiles or restricted spaces.
