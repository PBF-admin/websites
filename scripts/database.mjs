import { readFileSync } from 'node:fs';

// Read SQL values without executing the dump or requiring a database server.
export function readDatabase(filename) {
  const sql = readFileSync(filename, 'utf8');
  const tables = {};
  const allowed = new Set(['wp_posts', 'wp_postmeta', 'wp_options', 'wp_terms', 'wp_term_taxonomy', 'wp_term_relationships', 'wp_h5p_contents', 'wp_h5p_libraries', 'wp_h5p_contents_libraries', 'wp_h5p_libraries_libraries']);
  const schemas = new Map([...sql.matchAll(/CREATE TABLE `([^`]+)` \(([\s\S]*?)\) ENGINE/g)]
    .map(([, name, body]) => [name, [...body.matchAll(/^  `([^`]+)`/gm)].map(match => match[1])]));
  const insert = /INSERT INTO `([^`]+)` VALUES /g;
  for (let match; (match = insert.exec(sql));) {
    const name = match[1];
    if (!allowed.has(name)) continue;
    const rows = tables[name] ||= [];
    const columns = schemas.get(name);
    let position = insert.lastIndex;
    while (sql[position] === '(') {
      position++;
      const values = [];
      while (true) {
        let value = '';
        if (sql[position] === "'") {
          position++;
          while (position < sql.length) {
            const char = sql[position++];
            if (char === '\\') {
              const next = sql[position++];
              value += ({ n: '\n', r: '\r', t: '\t', '0': '\0', Z: '\x1a' })[next] ?? next;
            } else if (char === "'") {
              if (sql[position] === "'") { value += "'"; position++; }
              else break;
            } else value += char;
          }
        } else {
          const start = position;
          while (sql[position] !== ',' && sql[position] !== ')') position++;
          const token = sql.slice(start, position);
          value = token === 'NULL' ? null : Number(token);
        }
        values.push(value);
        if (sql[position++] === ')') break;
      }
      if (values.length !== columns.length) throw new Error(`Invalid row in ${name}`);
      rows.push(Object.fromEntries(columns.map((column, index) => [column, values[index]])));
      if (sql[position] === ',') position++;
    }
    insert.lastIndex = position;
  }
  return tables;
}

export function unserialize(value) {
  if (typeof value !== 'string' || !/^[abisdNO]:|^N;/.test(value)) return value;
  const buffer = Buffer.from(value);
  let position = 0;
  function until(delimiter) {
    const end = buffer.indexOf(delimiter, position);
    if (end < 0) throw new Error('Malformed PHP serialized value');
    const result = buffer.subarray(position, end).toString();
    position = end + 1;
    return result;
  }
  function parse() {
    const type = String.fromCharCode(buffer[position++]);
    if (type === 'N') { position++; return null; }
    position++;
    if (type === 's') {
      const length = Number(until(':'));
      position++;
      const result = buffer.subarray(position, position + length).toString();
      position += length + 2;
      return result;
    }
    if (type === 'a') {
      const count = Number(until(':'));
      position++;
      const result = {};
      for (let i = 0; i < count; i++) {
        const key = parse();
        result[key] = parse();
      }
      position++;
      return result;
    }
    if (type === 'b') return until(';') === '1';
    if (type === 'i' || type === 'd') return Number(until(';'));
    throw new Error(`Unsupported PHP serialization type: ${type}`);
  }
  return parse();
}
