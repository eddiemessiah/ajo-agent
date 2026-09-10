# Ajo Agent

A savings circle — ajo, esusu, susu — with an agent holding the book.

Five people each put in 5 USA₮ a week. Every week the agent pays the whole
25 USA₮ pot to whoever's turn it is, then moves to the next person. After
five weeks everyone has been paid exactly once, and it starts again.

That is the entire agent. One job, one verb.

Built live with Women in Blockchain Africa for the
[Celo Agents at Work Hackathon](https://celoplatform.notion.site/Agents-at-Work-Hackathon-3c1d5cb803de81139de7f4f3d09e55dc).

## Run it

```bash
npm install
npm run payout                 # dry run — shows the bill, spends nothing
npm run payout -- --execute    # actually sends
```

Dry run is the default on purpose. You have to ask for spending.

## Configure

`circle.json` holds the members, their wallets, the weekly contribution and
whose turn it is. Editing that file is the whole configuration.

```bash
export AGENT_PRIVATE_KEY=0x...        # the circle's agent wallet
export CELO_TAG=celo_yourtag          # your attribution tag from registration
```

## The one line that matters

Every transaction carries an attribution tag in its calldata (`src/tag.ts`).
The tag has to be there **when you send** — it lives in the calldata, so
there is no backfill, ever. Register first, wire the tag in, then send your
first transaction. Not the other way round.

Your agent wallet is the opposite: x402 settlements are attributed to it
retroactively across the whole window, so that one is safe to add late.

## Why it's shaped this way

Three things were true of every top-graded project in the last hackathon:

- **Owned distribution** — the WhatsApp group already exists. Nobody
  downloads anything.
- **One narrow job** — pay one person, once a week.
- **Steady commits** across the window, not a final-weekend push.

No project built around a general-purpose agent has ever placed in the
top tier.

## Token

USA₮ on Celo mainnet — `0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771`

Claim it free after one Self verification (passport, national ID or Aadhaar).
It is the one stablecoin that counts for both halves of the stablecoin prize.
