# Selected writing

Curated September 10, 2026. This is an editorial recommendation, not a popularity
ranking: readership, claps, and completion rates were not available.

## Scope and approach

Indexed 101 non-draft items across the local Medium export (March 17, 2026) and
the newer public RSS feed. This includes a few short replies, which were excluded
from consideration. Reviewed openings across the archive and read the strongest
candidates in full. The feed/export combination covers published entries from
2013 through August 2026; it cannot rule out deleted, unexported, or older posts
substantially revised since export. Image-led entries were not fully evaluated.
No unpublished drafts were selected or copied into the site.

The shortlist favors a clear idea, concrete personal examples, continuing
relevance, and range. Ten entries keep the homepage compact. Dates and links are
from the export's publication metadata or RSS. The build always sorts newest first.

## Homepage shortlist

| Date | Essay | Why it earns a place |
| --- | --- | --- |
| Aug 2026 | [When AI gives you more](https://slowframe.medium.com/when-ai-gives-you-more-94978e9f1619) | A timely, practical entry point: the hidden cost of reviewing AI output and how to retain ownership of the work. |
| May 2026 | [Watches as Cosplay and the Objects that Own Us](https://slowframe.medium.com/watches-as-cosplay-and-the-objects-that-own-us-b4e11ad0fdbf) | Distinctive personal voice; connects craftsmanship, identity, consumer behavior, and the stories objects carry. |
| Oct 2025 | [Lecturer, Lecturing](https://medium.com/@slowframe/lecturer-lecturing-7f878ceb742f) | Shows the educator behind the bio, especially the value of helping a learner's understanding click into place. |
| Jun 2025 | [Notes on Notes](https://medium.com/@slowframe/notes-on-notes-4d396c313813) | An honest internal argument with an earned turn at the end: the act of recording a thought may already have done its job. |
| Aug 2024 | [Powerpoint Craftsman](https://medium.com/@slowframe/powerpoint-craftsman-1e80347c77c2) | A memorable professional self-portrait that reveals your standards for narrative, thinking, and communication. |
| Jan 2024 | [The Tyranny of the Measurable](https://medium.com/@slowframe/the-tyranny-of-the-measurable-2e2823a589b3) | A useful provocation for product readers about mistaking metrics for the values they approximate. |
| Sep 2023 | [The Fiction of Frictionless](https://medium.com/@slowframe/the-fiction-of-frictionless-356c8356972e) | My strongest starting-point recommendation. Concrete scenes build into a challenge to a central product-design assumption: less friction is not always better. |
| Apr 2023 | [The Photographic Rendering of Words: How Writing Will Evolve in the Age of AI](https://medium.com/@slowframe/the-impressionism-of-writing-how-writing-will-evolve-in-the-age-of-ai-d6f139ef0d6a) | An imaginative historical analogy that gives your AI perspective depth beyond recent tools and news. |
| Jun 2020 | [Career as a Canvas](https://medium.com/@slowframe/career-as-a-canvas-3bf7486fe490) | An accessible, durable metaphor for a nonlinear career, with enough personal detail to distinguish it from generic advice. |
| Jul 2017 | [Product-Self Fit: Choosing What to Buy and Why](https://medium.com/@slowframe/product-self-fit-f051d2f97c5f) | An older piece that still holds up: buying a camera becomes a lens on values, creative potential, and self-knowledge. |

## Strong alternates

- **How to be AI-Proof (March 2025):** choose this for a more explicitly AI-and-learning audience. Left out to avoid crowding the page with AI essays.
- **Longform and Deep Work (September 2025):** a good companion to Notes on Notes; the latter feels more singular and personal.
- **2024: Year in Review (December 2024):** include if you want fatherhood and personal life to feature more prominently.
- **Product as Cultural Force (March 2014):** demonstrates the long-running product interest, but dated industry judgments make it less evergreen than Product-Self Fit.

## Maintenance

Edit `writing` in `content/site.json`, then run `node scripts/build.mjs`.
`python3 scripts/update-writing.py` saves recent candidates separately to
`content/latest-writing.json`; it never overwrites this selection.
