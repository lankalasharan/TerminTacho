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

Daily digest commands:

```bash
npm run social:email:digest
npm run social:daily
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

Required for email digest:

- RESEND_API_KEY: Resend API key

Hardcoded defaults in the script:

- Recipient defaults to termintacho@gmail.com
- Sender defaults to termintacho@gmail.com
- Timezone defaults to Europe/Berlin

You can still override these with env vars if needed.

Optional for email digest:

- EMAIL_FROM: sender identity, defaults to TerminTacho <noreply@termintacho.de>
- SOCIAL_DIGEST_WINDOW_HOURS: rolling window, defaults to 24
- SOCIAL_DIGEST_MAX_ITEMS: defaults to 40
- SOCIAL_DIGEST_TIMEZONE: defaults to Europe/Berlin

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

Mobile-first workflow (recommended):

1. Schedule npm run social:daily in Coolify for every evening.
2. Receive digest email on your phone.
3. Open each Reddit link from email.
4. Copy and adjust suggested reply.
5. Post manually.

Coolify schedule example:

- Command: npm run social:daily
- Cron: 0 18 * * *
- Timezone: Europe/Berlin

This sends one evening digest with all candidates from the last 24 hours.

## Facebook note

Facebook data should be accessed through the Graph API with proper app permissions.
Do not scrape personal profiles or restricted spaces.
