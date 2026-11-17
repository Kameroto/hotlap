/* global require, process */
/* eslint-disable @typescript-eslint/no-require-imports -- Synchronous vanilla-Node --require preload, without a child TypeScript loader. */
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');

// Injected only into the runner's Next.js children, never the user's services.
const run = process.env.HOTLAP_E2E_RUN_DIR;
if (!run || !path.isAbsolute(run)) throw new Error('Missing catalogue runtime ownership directory');
const raw = fs.readFileSync('/proc/self/stat', 'utf8');
const fields = raw.slice(raw.lastIndexOf(') ') + 2).split(' ');
const identity = {
  run, pid: process.pid, ppid: process.ppid, start: fields[19],
  name: raw.slice(raw.indexOf('(') + 1, raw.lastIndexOf(') ')),
  executable: process.execPath, commandLine: process.argv,
};
const record = exitCode => {
  const file = path.join(run, 'owned', `${process.pid}-${identity.start}.json`);
  fs.writeFileSync(`${file}.tmp`, JSON.stringify({ ...identity, exitCode }));
  fs.renameSync(`${file}.tmp`, file);
};
record(null);
process.on('exit', record);

const connect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  const normalized = Array.isArray(args[0]) ? args[0] : args;
  const option = normalized[0];
  const port = Number(option && typeof option === 'object' ? option.port : option);
  if ([3000, 4000, 5432].includes(port)) {
    const file = path.join(run, 'blocked-connections.jsonl');
    if (!fs.existsSync(file) || fs.statSync(file).size < 65536) {
      fs.appendFileSync(file, JSON.stringify({ utc: new Date().toISOString(), pid: process.pid, port }) + '\n');
    }
    throw new Error(`Catalogue runner forbids outbound port ${port}`);
  }
  return connect.apply(this, args);
};
