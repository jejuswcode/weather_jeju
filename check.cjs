const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync('dist/app.js', 'utf8');
function setup(key, fetcher) {
  const nodes = new Map();
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, { textContent: id === 'temperature' ? '—' : '', value: '', classList: { add() {}, remove() {} }, addEventListener(type, fn) { this[type] = fn; }, setAttribute() {}, querySelector() { return node('submit'); }, focus() {} });
    return nodes.get(id);
  };
  const context = { document: { getElementById: node, querySelector: () => node('card') }, sessionStorage: { getItem: () => key, setItem() {} }, URL, URLSearchParams, AbortController, setTimeout, clearTimeout, fetch: fetcher };
  vm.runInNewContext(source, context);
  return node;
}
const settle = () => new Promise(resolve => setImmediate(resolve));
(async () => {
  let calls = 0;
  const node = setup('test-key', async url => {
    calls++;
    assert.equal(url.origin + url.pathname, 'https://api.weatherapi.com/v1/current.json');
    assert.equal(url.searchParams.get('lang'), 'ko');
    assert.equal(url.searchParams.get('q'), '33.4996,126.5312');
    return { ok: true, json: async () => ({ current: { temp_c: 19.2, humidity: 72, condition: { text: '맑음', icon: '//cdn.weatherapi.com/weather/64x64/day/113.png' }, last_updated: '2026-11-04 11:15' } }) };
  });
  await settle();
  assert.equal(calls, 1);
  assert.equal(node('temperature').textContent, '19.2');
  assert.equal(node('humidity').textContent, 72);
  assert.equal(node('condition').textContent, '맑음');
  assert.equal(node('updated').textContent, '2026-11-04 11:15');
  await node('refresh').click();
  assert.equal(calls, 2);
  assert.equal(node('refresh').disabled, false);
  const missing = setup('', () => { throw Error('Unexpected fetch'); });
  assert.match(missing('status').textContent, /API 키/);
  const failed = setup('bad-key', async () => ({ ok: false, json: async () => ({ error: { code: 2006 } }) }));
  await settle();
  assert.match(failed('status').textContent, /올바르지/);
  assert.equal(failed('refresh').disabled, false);
  console.log('Passed: automatic load, Korean request, four fields, refresh, missing key, API error.');
})().catch(error => { console.error(error); process.exitCode = 1; });
