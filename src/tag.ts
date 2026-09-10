/**
 * The attribution tag (ERC-8021).
 *
 * This is the single most important line in the whole project.
 * The tag lives in the transaction's CALLDATA, which means it has to be
 * there at the moment you send. There is no backfill, ever. If you send
 * a hundred transactions without it, those hundred are permanently
 * uncounted on every hackathon leaderboard.
 *
 * A "data suffix" is exactly what it sounds like: extra bytes glued onto
 * the end of the normal function calldata. The contract ignores them.
 * The indexer reads them.
 */

/** Turn an ASCII tag like "celo_ajoagent" into hex bytes. */
function toHex(s: string): string {
  return Array.from(new TextEncoder().encode(s))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Build the suffix appended to every transaction's calldata.
 *
 * Pass an array so you can keep your own code alongside the assigned one:
 *   toDataSuffix(['my_code', 'celo_ajoagent'])
 * Only the tag Celo assigned you is credited.
 */
export function toDataSuffix(tags: string[]): `0x${string}` {
  return `0x${tags.map(toHex).join('')}`;
}

/** Glue the suffix onto calldata. `data` already starts with 0x. */
export function withTag(data: `0x${string}`, tags: string[]): `0x${string}` {
  return `${data}${toDataSuffix(tags).slice(2)}` as `0x${string}`;
}
