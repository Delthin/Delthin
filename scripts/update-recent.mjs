import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const START = '<!-- RECENT-WORK:START -->';
const END = '<!-- RECENT-WORK:END -->';
const LIMIT = 4;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

export function selectRepositories(repositories, owner) {
  return repositories.filter((repo) =>
    repo.private === false && !repo.fork && !repo.archived && !repo.disabled &&
    repo.owner?.login?.toLowerCase() === owner.toLowerCase() &&
    repo.name.toLowerCase() !== owner.toLowerCase() && repo.size > 0 &&
    Number.isFinite(Date.parse(repo.pushed_at))
  ).sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at) || a.name.localeCompare(b.name))
    .slice(0, LIMIT);
}

export function renderRepositories(repositories) {
  if (repositories.length === 0) throw new Error('No eligible public repositories; keeping the existing README.');
  const rows = [];
  for (let i = 0; i < repositories.length; i += 2) {
    const cells = repositories.slice(i, i + 2).map((repo) => {
      const url = `https://github.com/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}`;
      const description = repo.description ? `<p>${escapeHtml(repo.description)}</p>\n` : '';
      const language = repo.language ? `<code>${escapeHtml(repo.language)}</code> · ` : '';
      const date = new Date(repo.pushed_at).toISOString().slice(0, 10);
      return `<td width="50%" valign="top">\n<h3><a href="${url}">${escapeHtml(repo.name)} ↗</a></h3>\n${description}<p>${language}<sub>最近推送：${date} UTC</sub></p>\n</td>`;
    });
    if (cells.length === 1) cells.push('<td width="50%"></td>');
    rows.push(`<tr>\n${cells.join('\n')}\n</tr>`);
  }
  return `<table>\n${rows.join('\n')}\n</table>`;
}

export function replaceRecentSection(readme, section) {
  if (readme.split(START).length !== 2 || readme.split(END).length !== 2) {
    throw new Error('Expected exactly one pair of recent-work markers.');
  }
  const start = readme.indexOf(START) + START.length;
  const end = readme.indexOf(END);
  if (end < start) throw new Error('Recent-work markers are out of order.');
  return `${readme.slice(0, start)}\n${section}\n${readme.slice(end)}`;
}

export async function fetchRepositories(owner, { fetchImpl = fetch, token = process.env.GITHUB_TOKEN } = {}) {
  const repositories = [];
  for (let page = 1; page <= 20; page++) {
    const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetchImpl(
      `https://api.github.com/users/${encodeURIComponent(owner)}/repos?type=owner&sort=pushed&direction=desc&per_page=100&page=${page}`,
      { headers, signal: AbortSignal.timeout(20_000) },
    );
    if (!response.ok) throw new Error(`GitHub repositories API returned ${response.status}; keeping the existing README.`);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error('Unexpected repositories API response.');
    repositories.push(...batch);
    const selected = selectRepositories(repositories, owner);
    if (selected.length === LIMIT || batch.length < 100) return selected;
  }
  throw new Error('Repository pagination limit reached; keeping the existing README.');
}

export async function updateRecent({ owner = 'Delthin', readmeUrl = new URL('../README.md', import.meta.url), fetchImpl = fetch, token } = {}) {
  // Complete all network requests before modifying the file.
  const repositories = await fetchRepositories(owner, { fetchImpl, token });
  const readme = await readFile(readmeUrl, 'utf8');
  const updated = replaceRecentSection(readme, renderRepositories(repositories));
  if (updated !== readme) await writeFile(readmeUrl, updated);
  return { changed: updated !== readme, projects: repositories.map((repo) => repo.name) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(JSON.stringify(await updateRecent({ owner: process.env.GITHUB_REPOSITORY_OWNER || 'Delthin' })));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
