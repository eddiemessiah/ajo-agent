/**
 * Ajo Agent — one job.
 *
 * Every week: pay the whole pot to whoever's turn it is, then advance.
 * That's the entire agent. It does nothing else, on purpose.
 *
 *   npm run payout              -> dry run, spends nothing
 *   npm run payout -- --execute -> actually sends
 */
import { readFileSync, writeFileSync } from 'node:fs';
import {
  createPublicClient, createWalletClient, http,
  encodeFunctionData, formatUnits, parseUnits, erc20Abi,
} from 'viem';
import { celo } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { withTag } from './tag.js';

// ── the things you change ────────────────────────────────────────────
const USAT = '0xD2ab3C9A02DBBAB236BfEC45D1d755DF4267F771' as const;
const TAG = process.env.CELO_TAG ?? 'celo_ajoagent';
const RPC = process.env.CELO_RPC ?? 'https://forno.celo.org';

type Member = { name: string; wallet: `0x${string}` };
type Circle = {
  name: string; token: string; contribution: string;
  week: number; members: Member[];
};

const execute = process.argv.includes('--execute');
const circle: Circle = JSON.parse(readFileSync('circle.json', 'utf8'));

// ── whose turn is it? ────────────────────────────────────────────────
// Week 0 pays the first member, week 1 the second, and it wraps around
// forever. Five members, five weeks, everyone gets paid exactly once.
const recipient = circle.members[circle.week % circle.members.length];

const publicClient = createPublicClient({ chain: celo, transport: http(RPC) });

// Read decimals off the token rather than assuming — guessing this wrong
// is how you accidentally send a millionth of what you meant to.
const decimals = await publicClient.readContract({
  address: USAT, abi: erc20Abi, functionName: 'decimals',
});

const potHuman = String(Number(circle.contribution) * circle.members.length);
const pot = parseUnits(potHuman, decimals);

// ── build the transaction ────────────────────────────────────────────
// Normal ERC-20 transfer calldata...
const transferData = encodeFunctionData({
  abi: erc20Abi,
  functionName: 'transfer',
  args: [recipient.wallet, pot],
});
// ...then the attribution tag glued onto the end. Now, not later.
const data = withTag(transferData, [TAG]);

// ── show the bill before spending anything ───────────────────────────
console.log(`\n  ${circle.name} — week ${circle.week}\n`);
for (const m of circle.members) {
  const turn = m.wallet === recipient.wallet;
  console.log(`   ${turn ? '>' : ' '} ${m.name.padEnd(8)} ${m.wallet}${turn ? '   <- gets paid' : ''}`);
}
console.log(`\n   ${circle.members.length} x ${circle.contribution} ${circle.token}`);
console.log(`   pot        ${formatUnits(pot, decimals)} ${circle.token}`);
console.log(`   pays       ${recipient.name}`);
console.log(`   tag        ${TAG}`);
console.log(`   calldata   ${data.slice(0, 42)}...${data.slice(-26)}`);

if (!execute) {
  console.log(`\n   Nothing has been spent. This is a dry run.`);
  console.log(`   Run with --execute to send.\n`);
  process.exit(0);
}

// ── send ─────────────────────────────────────────────────────────────
const key = process.env.AGENT_PRIVATE_KEY;
if (!key) {
  console.error(`\n   AGENT_PRIVATE_KEY is not set. Nothing sent.\n`);
  process.exit(1);
}

const account = privateKeyToAccount(key as `0x${string}`);
const wallet = createWalletClient({ account, chain: celo, transport: http(RPC) });

const hash = await wallet.sendTransaction({ to: USAT, data, value: 0n });
console.log(`\n   sent       ${hash}`);
console.log(`   celoscan   https://celoscan.io/tx/${hash}`);

await publicClient.waitForTransactionReceipt({ hash });

// Advance the circle so next week pays the next person.
circle.week += 1;
writeFileSync('circle.json', JSON.stringify(circle, null, 2) + '\n');
console.log(`   next up    ${circle.members[circle.week % circle.members.length].name}\n`);
