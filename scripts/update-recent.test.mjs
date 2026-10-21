import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { selectRepositories, renderRepositories, replaceRecentSection, fetchRepositories, updateRecent } from './update-recent.mjs';

const repository = (name, overrides = {}) => ({
  name, owner: { login: 'Delthin' }, private: false, fork: false, archived: false,
  disabled: false, size: 10, pushed_at: '2026-09-01T00:00:00Z',
  description: null, language: 'TypeScript', ...overrides,
});
const before = '# Profile\n\n研究方向：GUI Agent · Agent Harness\n<!-- RECENT-WORK:START -->\nold\n<!-- RECENT-WORK:END -->\n\nInterests\n';
const response = (repos) => ({ ok: true, json: async () => repos });

test('only eligible owned public repositories are displayed, newest push first', () => {
  const selected = selectRepositories([
    repository('old'), repository('new', { pushed_at: '2026-10-01T00:00:00Z' }),
    repository('Delthin'), repository('secret', { private: true }),
    repository('unknown-visibility', { private: undefined }),
    repository('fork', { fork: true }), repository('archive', { archived: true }),
    repository('disabled', { disabled: true }), repository('empty', { size: 0 }),
    repository('someone-else', { owner: { login: 'AnotherOwner' } }),
    repository('undated', { pushed_at: null }),
  ], 'Delthin');
  assert.deepEqual(selected.map(({ name }) => name), ['new', 'old']);
});

test('card data is escaped and repository URLs are constructed from the owner/name', () => {
  const html = renderRepositories([repository('safe', {
    html_url: 'javascript:alert(1)', description: '<img src=x onerror="alert(1)"> & text',
    language: 'C++',
  })]);
  assert.ok(html.includes('href="https://github.com/Delthin/safe"'));
  assert.ok(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; text'));
  assert.ok(html.includes('最近推送：2026-09-01 UTC'));
  assert.ok(!html.includes('<img') && !html.includes('javascript:'));
  assert.equal((html.match(/<td /g) || []).length, 2);
  assert.throws(() => renderRepositories([]), /No eligible public repositories/);
});

test('only the generated section changes; invalid markers fail instead of overwriting', () => {
  assert.equal(replaceRecentSection(before, 'new'), before.replace('\nold\n', '\nnew\n'));
  for (const invalid of ['no markers', before + '<!-- RECENT-WORK:START -->', '<!-- RECENT-WORK:END --><!-- RECENT-WORK:START -->']) {
    assert.throws(() => replaceRecentSection(invalid, 'new'), /markers/);
  }
});

test('pagination continues past filtered repositories and limits output to four', async () => {
  const urls = [];
  const selected = await fetchRepositories('Delthin', {
    token: '',
    fetchImpl: async (url) => {
      urls.push(url);
      return response(urls.length === 1
        ? Array.from({ length: 100 }, (_, i) => repository(`fork-${i}`, { fork: true }))
        : ['one', 'two', 'three', 'four', 'five'].map((name, i) => repository(name, { pushed_at: `2026-09-0${5 - i}T00:00:00Z` })));
    },
  });
  assert.equal(urls.length, 2);
  assert.ok(urls[1].endsWith('page=2'));
  assert.deepEqual(selected.map(({ name }) => name), ['one', 'two', 'three', 'four']);
});

test('API failure preserves the README; successful refresh is idempotent', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'profile-recent-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const readmeUrl = join(dir, 'README.md');
  await writeFile(readmeUrl, before);
  await assert.rejects(updateRecent({ readmeUrl, token: '', fetchImpl: async () => ({ ok: false, status: 403 }) }), /403/);
  assert.equal(await readFile(readmeUrl, 'utf8'), before);
  await assert.rejects(updateRecent({ readmeUrl, token: '', fetchImpl: async () => response([]) }), /No eligible/);
  assert.equal(await readFile(readmeUrl, 'utf8'), before);
  const options = { readmeUrl, token: '', fetchImpl: async () => response([repository('current')]) };
  assert.equal((await updateRecent(options)).changed, true);
  const updated = await readFile(readmeUrl, 'utf8');
  assert.ok(updated.includes('研究方向：GUI Agent · Agent Harness'));
  assert.ok(updated.endsWith('\n\nInterests\n'));
  assert.equal((await updateRecent(options)).changed, false);
});
