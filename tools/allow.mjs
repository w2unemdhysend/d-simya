// Prints the line to add to FAMILY in worker/config.js for a Telegram username (the name itself is not stored there).
//   npm run allow -- <username>
import { nameHash } from '../worker/access.js';

const name = process.argv[2];
if (!name) { console.error('usage: npm run allow -- <telegram username>'); process.exit(2); }
console.log(`  '${await nameHash(name)}',`);
