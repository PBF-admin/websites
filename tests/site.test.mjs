import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';
import { readDatabase, unserialize } from '../scripts/database.mjs';
import { inspectSite } from '../scripts/check.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(path.join(root, file), 'utf8');
const database = readDatabase(path.join(root, 'smotradb.sql'));
const report = JSON.parse(read('dist/migration-report.json'));

test('PHP serialized options preserve nested arrays and UTF-8 byte lengths', () => {
  assert.deepEqual(unserialize('a:2:{s:4:"name";s:5:"žaba";s:5:"items";a:2:{i:0;b:1;i:1;N;}}'), {
    name: 'žaba', items: { 0: true, 1: null }
  });
  assert.equal(unserialize('i:42;'), 42);
  assert.equal(unserialize('d:1.5;'), 1.5);
  assert.equal(unserialize('unserialized'), 'unserialized');
});

test('the SQL reader imports published content but excludes private user tables', () => {
  assert.equal(database.wp_posts.length, 1809);
  assert.equal(database.wp_posts.find(page => page.ID === 7).post_title, 'Naslovnica');
  assert.equal(database.wp_users, undefined);
  assert.equal(database.wp_usermeta, undefined);
  assert.equal(database.wp_comments, undefined);
  assert.equal(database.wp_h5pxapikatchu, undefined);
});

test('every published page and post has a static HTML document', () => {
  const published = database.wp_posts.filter(page => page.post_status === 'publish' && ['page', 'post'].includes(page.post_type));
  assert.equal(report.pages.length, published.length);
  assert.equal(published.filter(page => page.post_type === 'page').length, 8);
  for (const post of published) {
    const entry = report.pages.find(page => page.id === post.ID);
    assert.ok(entry, `Missing page ${post.ID}`);
    const html = read(`dist${entry.route}index.html`);
    assert.ok(html.includes(`data-page-id="${post.ID}"`));
    assert.ok(html.includes('<html lang="hr">'));
    assert.ok(html.includes('Glavni izbornik'));
    assert.ok(html.includes('name="viewport"'));
  }
});

test('all generated references resolve with no private files or external theme dependencies', () => {
  assert.deepEqual(report.missingAssets, []);
  assert.deepEqual(report.warnings, []);
  const result = inspectSite();
  assert.ok(result.references > 1000);
  assert.deepEqual(result.errors, []);
});

test('header, homepage slide and all eleven menu items come from the export', () => {
  const html = read('dist/index.html');
  assert.ok(html.includes('/2021/10/banner_new.png'));
  assert.ok(html.includes('/2021/11/naslovna3_1-2.jpg'));
  const navigation = html.match(/<ul id="main-menu">([\s\S]*?)<\/ul>/)[1];
  assert.equal([...navigation.matchAll(/<li\b/g)].length, 11);
  assert.ok(html.includes('href="/nutricionizam/"'));
  assert.ok(html.includes('href="/biotehnologija/"'));
  assert.ok(html.includes('href="/prehrambena-biotehnolgija/"'));
});

test('legacy query links, hashes and friendly aliases are preserved', () => {
  for (const url of ['/?page_id=71', '/index.php?page_id=71', '/index.html?page_id=71']) {
    const parsed = new URL(url + '#program', 'https://static.invalid');
    let redirected;
    vm.runInNewContext(read('dist/assets/routes.js'), {
      URLSearchParams, location: {
        search: parsed.search, pathname: parsed.pathname, hash: parsed.hash,
        replace(value) { redirected = value; }
      }
    });
    assert.equal(redirected, '/zajednicki-predmeti/#program');
  }
  for (const alias of ['o-nama', 'studiji', 'prehrambena-tehnologija', 'smotre']) assert.ok(read(`dist/${alias}/index.html`).startsWith('<!doctype html>'));
  const parsed = new URL('/?page_id=223#program', 'https://static.invalid');
  let redirected;
  vm.runInNewContext(read('dist/assets/routes.js'), {
    URLSearchParams, location: {
      search: parsed.search, pathname: parsed.pathname, hash: parsed.hash,
      replace(value) { redirected = value; }
    }
  });
  assert.equal(redirected, '/smotre/#program');
});

test('archive accordions and their original titles are rendered natively', () => {
  const html = read('dist/smotre/index.html');
  assert.equal([...html.matchAll(/<section class="accordion"/g)].length, 10);
  assert.ok(html.indexOf('31. Smotra Sveučilišta u Zagrebu') < html.indexOf('<strong>2025</strong>'));
  const gallery = html.match(/<details name="accordion-2026">([\s\S]*?)<\/details>/)?.[1];
  assert.ok(gallery, 'Missing the 2026 photo gallery accordion');
  assert.ok(gallery.includes('<summary>Pogledaj slike sa SMOTRE 2026</summary>'));
  assert.ok(!html.match(/<details name="accordion-2026" open>/), 'The 2026 photo gallery should be closed initially');
  assert.equal([...gallery.matchAll(/data-lightbox/g)].length, 13);
  for (const photo of [
    'IMG-20261111-WA0026.jpg', 'IMG-20261111-WA0032.jpg', 'IMG-20261111-WA0040.jpg',
    'IMG-20261113-WA0071.jpg', 'IMG-20261113-WA0075.jpg', 'IMG-20261113-WA0095.jpg',
    'IMG-20261113-WA0113.jpg', '20261114_151551.jpg', '20261114_170809.jpg',
    '20261114_173701.jpg', '20261114_181443.jpg', '20261114_182006.jpg', '20261114_182022.jpg'
  ]) assert.ok(gallery.includes(`/wp-content/uploads/2026/12/${photo}`), `Missing 2026 photo: ${photo}`);
  for (const image of [
    'pbf-zemlji-cudesa.png', 'otkrij-svoj-pbf-smjer.png', 'spoji-niz.jpeg',
    'bomboni.png', 'mikroinkapsulacija.png', 'porcija.png', 'mikroorganizmi.jpeg',
    'pipette-art.png', 'dna-detektivi.jpeg', 'fermentacija-kava-kakao.jpeg'
  ]) assert.ok(html.includes(`/wp-content/uploads/2026/11/${image}`), `Missing 2026 image: ${image}`);
  assert.ok(html.includes('Kahoot kviz o fermentaciji'));
  assert.ok(html.includes('Vidimo se na štandu PBF-a!'));
  for (const id of [2209, 1903, 2005, 2026, 2073, 2097, 2114, 2123, 2136]) {
    const source = database.wp_postmeta.find(row => row.post_id === id && row.meta_key === 'sp_eap_upload_options');
    const items = Object.values(unserialize(source.meta_value).accordion_content_source);
    for (const item of items) {
      assert.ok(html.includes(item.accordion_content_title), `Missing accordion heading: ${item.accordion_content_title}`);
    }
  }
  assert.ok(report.pages.find(page => page.id === 223).route === '/smotre/');
  const oldRoute = read('dist/prijasnje-godine/index.html');
  assert.ok(oldRoute.includes('location.replace(\'/smotre/\''));
  assert.ok(read('dist/_redirects').includes('/prijasnje-godine/ /smotre/ 301'));
});

test('the standalone smoothie quiz covers all 48 combinations without ambiguous or fallback results', () => {
  const context = vm.createContext({ document: { addEventListener() {} } });
  vm.runInContext(read('dist/wp-content/uploads/kviz/app.js'), context);
  const results = JSON.parse(vm.runInContext(`JSON.stringify(
    Object.keys(optionData.baze).flatMap(baza =>
      Object.keys(optionData.sastojci).flatMap(sastojak =>
        Object.keys(optionData.dodaci).map(dodatak => ({
          matchCount: Object.values(studyData).filter(study =>
            study.kombinacije.some(c => c.baza === baza && c.sastojak === sastojak && c.dodatak === dodatak)
          ).length,
          result: findStudy(baza, sastojak, dodatak).key
        }))
      )
    ))`, context));
  assert.equal(results.length, 48);
  assert.ok(results.every(result => result.matchCount === 1));
  assert.deepEqual([...new Set(results.map(result => result.result))].sort(), ['biotehnologija', 'nutricionizam', 'prehrambene_tehnologije']);
  const html = read('dist/wp-content/uploads/kviz/index.html');
  assert.ok(html.includes('/assets/confetti.js'));
  assert.ok(html.includes('/assets/quiz-accessibility.js'));
  assert.ok(!html.includes('cdn.jsdelivr'));
});

test('calorimetry includes all supported video interactions, four questions and final summary', () => {
  const original = JSON.parse(database.wp_h5p_contents.find(row => row.id === 3).parameters).interactiveVideo;
  const generated = JSON.parse(read('dist/assets/video-3.json'));
  assert.equal(generated.videoId, 'gU0qFJfbR7w');
  assert.deepEqual(generated.interactions, original.assets.interactions.filter(item => item.action.library !== 'H5P.Nil 1.0'));
  assert.deepEqual(generated.summary, original.summary.task.params);
  const html = read('dist/zajednicki-predmeti/index.html');
  assert.equal([...html.matchAll(/class="exercise" data-exercise=/g)].length, 4);
  assert.ok(html.includes('data-summary="0"'));
  assert.ok(html.includes('/assets/interactive-video.js'));
  const studentLife = read('dist/studentski-zivot/index.html');
  assert.ok(studentLife.includes('class="video-thumbnail-link"'));
  assert.ok(studentLife.includes('aria-label="Pogledaj video na YouTubeu"'));
});
