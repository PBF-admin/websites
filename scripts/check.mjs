import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');

export function inspectSite(directory = root) {
  const errors = [];
  const files = [];
  function walk(folder) {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const filename = path.join(folder, entry.name);
      if (entry.isDirectory()) walk(filename);
      else files.push(filename);
    }
  }
  walk(directory);
  let references = 0;
  function checkLink(value, from) {
    const url = new URL(value.replaceAll('&amp;', '&'), `https://static.invalid/${path.relative(directory, from).split(path.sep).join('/')}`);
    if (url.hostname !== 'static.invalid' || !url.pathname) return;
    references++;
    let target = path.join(directory, decodeURIComponent(url.pathname));
    if (existsSync(target) && statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (!existsSync(target)) errors.push(`${path.relative(directory, from)}: missing ${url.pathname}`);
  }
  for (const file of files) {
    if (/\.html$/.test(file)) {
      const html = readFileSync(file, 'utf8');
      if (/\[(?:\/?fusion_|h5p\s|sp_easyaccordion\s|gallery\s)/.test(html)) errors.push(`${file}: unrendered shortcode`);
      if (/(?:https?:)?\/\/smotra\.pbf\.hr/.test(html)) errors.push(`${file}: original site dependency`);
      for (const match of html.matchAll(/\b(?:href|src|data-interactive-video)="([^"]*)"/g)) {
        if (!match[1].startsWith('#') && match[1]) checkLink(match[1], file);
      }
      for (const match of html.matchAll(/\bsrcset="([^"]*)"/g)) {
        for (const item of match[1].split(',')) checkLink(item.trim().split(/\s+/)[0], file);
      }
    } else if (/\.css$/.test(file)) {
      for (const match of readFileSync(file, 'utf8').matchAll(/url\((?:'([^']*)'|"([^"]*)"|([^)]*))\)/g)) {
        const url = match[1] ?? match[2] ?? match[3];
        if (/^https?:/.test(url)) errors.push(`${file}: external CSS dependency ${url}`);
        else checkLink(url, file);
      }
    }
    if (/\.(?:php|sql|env|bak)$/i.test(file)) errors.push(`Private source file in output: ${file}`);
  }
  return { files: files.length, references, errors: [...new Set(errors)] };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = inspectSite();
  console.log(`Checked ${result.files} output files and ${result.references} local references.`);
  if (result.errors.length) {
    console.error(result.errors.join('\n'));
    process.exitCode = 1;
  } else console.log('All local pages, images, fonts, scripts and styles resolve. No PHP or database files are published.');
}
