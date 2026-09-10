import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const data = JSON.parse(await readFile(new URL("content/site.json", root), "utf8"));
const escape = (text) => String(text).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);
const link = (url) => {
  if (new URL(url).protocol !== "https:") throw new Error(`Expected an HTTPS link: ${url}`);
  return escape(url);
};
const arrow = '<span class="arrow" aria-hidden="true">&#8599;</span>';
const dateLabel = new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" });
const writing = [...data.writing].sort((a, b) => b.date.localeCompare(a.date)).map((article, index) => `<li>
  <a class="writing-row" href="${link(article.url)}">
    <span class="entry-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
    <span class="entry-title">${escape(article.title)}</span>
    <time datetime="${escape(article.date)}">${dateLabel.format(new Date(article.date))}</time>${arrow}
  </a>
</li>`).join("\n");
const projects = data.projects.length ? `<ul class="project-list">${data.projects.map((project, index) => `<li class="project">
  <div class="project-art art-${index % 3}" aria-hidden="true"><span></span><span></span><span></span></div>
  <div class="project-copy"><p class="eyebrow">${escape(project.status || `Project ${String(index + 1).padStart(2, "0")}`)}</p>
  <h3>${project.url ? `<a href="${link(project.url)}">${escape(project.title)} ${arrow}</a>` : escape(project.title)}</h3>
  ${project.description ? `<p>${escape(project.description)}</p>` : '<p class="project-note">More details soon.</p>'}
  ${project.tags?.length ? `<p class="project-tags">${project.tags.map(escape).join(" / ")}</p>` : ""}</div>
</li>`).join("\n")}</ul>` : `<div class="project-placeholder"><h3>Coming soon</h3><p>A space for the things I build.</p></div>`;
const talks = data.talks.map((talk, index) => `<li><a class="talk-row" href="${link(talk.url)}">
  <span class="entry-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
  <span class="talk-copy"><span class="talk-title">${escape(talk.title)}</span><span class="talk-description">${escape(talk.description)}</span></span>
  <span class="watch">Watch ${arrow}</span>
</a></li>`).join("\n");
const replacements = {
  NAME: escape(data.name), TAGLINE: escape(data.tagline), BIO: escape(data.bio),
  BIO_URL: link(data.bioUrl), WRITING_URL: link(data.writingUrl), LINKEDIN_URL: link(data.linkedinUrl),
  GOODREADS_URL: link(data.goodreadsUrl), WRITING: writing, PROJECTS: projects, TALKS: talks,
  YEAR: new Date().getFullYear(),
};
const template = await readFile(new URL("templates/index.html", root), "utf8");
const html = template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
  if (!(key in replacements)) throw new Error(`Unknown template field: ${key}`);
  return replacements[key];
});
await writeFile(new URL("index.html", root), html);
console.log(`Built index.html: ${data.writing.length} articles, ${data.projects.length} projects, ${data.talks.length} talks.`);
