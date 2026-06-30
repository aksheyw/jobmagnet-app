# JobMagnet — a case study

**The bet:** a job application is a product problem, so the strongest thing I could build in a week was not another résumé generator but a system that makes your portfolio feel like it already belongs to the company you are applying to. You paste your profile and a job link, and about ninety-six seconds later you have a portfolio website rendered in that company's own brand, with a tailored narrative and a short critique of their actual product underneath. I built it solo for the OpenAI x Outskill AI Builders Hackathon, and the whole thing runs at zero incremental cost.

## The problem
Every PM-style application has the same arc. You read the job description, you try to match your experience to it, you write a cover letter that is a little less generic than the last one, and then you send a portfolio that looks identical no matter who is receiving it. The matching is the part everyone already does, so I cared more about the part almost nobody does, which is making the output feel specific to the company on the other side. For that to land, three things had to be true at once: the page had to carry the employer's real brand, the narrative had to be reordered around their job description, and there had to be evidence underneath that I had genuinely thought about their product.

## The decisions that mattered most
The one that taught me the most was realising that delivering the brand is a rendering problem, not a data problem. Storing a company's colours and fonts is easy, and if I had stopped there every site would have been one template with a swapped accent colour. The harder and more interesting part was making each company render as a genuinely different site, so the mood and the layout change and not just the highlight. The gallery is the proof of that, because it is one résumé across eight companies and eight distinctly different looks.

The second was choosing five specialised agents over one large prompt. A Research agent reads the job and resolves the real employer domain even when the link is an ATS page, a Brand agent extracts the look, a Narrative agent rewrites the story, a Pitch agent writes a product critique, and a deterministic Code agent assembles and zips a real Next.js project. Five focused agents beat one mega-prompt on latency, on token cost, on output quality, and, just as importantly, on how easy it is to debug a single stage when it misbehaves.

The third was a product principle rather than a technical one, which is that you own the output. JobMagnet hands you a downloadable Next.js project that you deploy to your own Vercel, so the portfolio lives at your URL and I host nothing, and that keeps the user in control while conveniently being the same choice that let the whole thing run with no per-tenant infrastructure to pay for.

## What I deliberately left out
In a week the discipline is mostly in what you choose not to build. I shipped the website and consciously deferred LinkedIn PDF parsing, magic-link email, downloadable cover letters, and a second template family, all of which I wired for later rather than left half-finished now. Shipping one sharp thing end to end taught me more than four unfinished ones would have, and it is the same prioritisation call I would make on a real roadmap against a real deadline.

## What I'd do next
The honest next step is productionising the parts the hackathon let me shortcut: swapping the ChatGPT Plus OAuth the agents currently run on for a metered OpenAI API key, adding the Code agent's in-container build verification so a generated site is guaranteed to compile before you download it, and earning a second template family so the brand range gets wider.

---

*Built by [Akshey Walia](https://www.linkedin.com/in/aksheywalia/). The product: [jobmagnet-app](https://github.com/aksheyw/jobmagnet-app) · the Codex agent runtime: [jobmagnet-codex](https://github.com/aksheyw/jobmagnet-codex) · [live demo](https://jobmagnet-app.vercel.app).*
