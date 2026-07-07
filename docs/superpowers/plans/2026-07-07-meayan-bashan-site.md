# אתר מעיין בשן - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, Hebrew (RTL) marketing website for מעיין בשן (body language expert) with 6 pages, self-service content editing via Decap CMS, and two Netlify Forms-powered contact forms — deployable for free on Netlify.

**Architecture:** Astro static site generator reads content from Astro content collections (Markdown files with frontmatter). Decap CMS runs as a static admin panel at `/admin` (loaded via CDN script, no build step) backed by Netlify Identity + Git Gateway — every content edit becomes a git commit that triggers a Netlify rebuild. No server, no database.

**Tech Stack:** Astro 5 (content layer API), Decap CMS 3 (CDN), Netlify (hosting + Forms + Identity + Git Gateway), plain CSS with custom properties for the brand palette (no CSS framework).

**Spec:** `docs/superpowers/specs/2026-07-07-meayan-bashan-site-design.md`

---

## Reference: brand palette

Defined once here, used throughout the plan:

- `--color-teal: #2f7d6e`
- `--color-orange: #f5a623`
- `--color-cream: #faf3e8`
- `--color-red: #e94f37`
- `--color-text: #2b2b2b`

These are placeholder hex values approximating the shared brand photos (teal blazer, orange/mustard accents, cream background, red pop color). **Task 13 includes a step to swap them for the exact brand hex codes once Meayan's brand guide / logo files are available.**

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `public/favicon.svg`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "meayan-bashan-site",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.1.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "typescript": "^5.7.2"
  }
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Placeholder — Task 12 replaces this with the real domain once DNS is connected.
  site: 'https://maayanbashan.co.il',
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules/
dist/
.astro/
.env
```

- [ ] **Step 5: Create `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="16" fill="#2f7d6e" />
  <text x="16" y="21" font-size="16" text-anchor="middle" fill="#faf3e8" font-family="sans-serif">מ</text>
</svg>
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, no errors.

- [ ] **Step 7: Verify Astro runs**

Run: `npx astro --version`
Expected: prints an Astro version number (5.x).

- [ ] **Step 8: Commit**

```bash
git add package.json astro.config.mjs tsconfig.json .gitignore public/favicon.svg
git commit -m "Scaffold Astro project"
```

---

### Task 2: Global styles and brand tokens

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `src/styles/global.css`**

```css
:root {
  --color-teal: #2f7d6e;
  --color-orange: #f5a623;
  --color-cream: #faf3e8;
  --color-red: #e94f37;
  --color-text: #2b2b2b;
  --font-base: 'Assistant', 'Segoe UI', sans-serif;
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-base);
  color: var(--color-text);
  background: white;
  line-height: 1.5;
}

img {
  max-width: 100%;
  display: block;
}

a {
  color: inherit;
}

h1, h2, h3 {
  line-height: 1.25;
  margin-top: 0;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "Add global styles and brand color tokens"
```

---

### Task 3: Content collections schema and example content

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/settings/settings.md`
- Create: `src/content/about/about.md`
- Create: `src/content/organizations/organizations.md`
- Create: `src/content/media/example-media-item.md`
- Create: `src/content/courses/example-course.md`
- Create: `src/content/testimonials/example-testimonial.md`
- Create: `src/content/partner_logos/example-logo.md`
- Create: `public/images/placeholder-hero.svg`
- Create: `public/images/logos/placeholder-logo.svg`

- [ ] **Step 1: Create `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const settings = defineCollection({
  loader: glob({ pattern: 'settings.md', base: './src/content/settings' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    heroImage: z.string(),
    shortBio: z.string(),
    phone: z.string(),
    email: z.string(),
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    facebook: z.string().optional(),
  }),
});

const about = defineCollection({
  loader: glob({ pattern: 'about.md', base: './src/content/about' }),
  schema: z.object({
    title: z.string(),
  }),
});

const organizations = defineCollection({
  loader: glob({ pattern: 'organizations.md', base: './src/content/organizations' }),
  schema: z.object({
    title: z.string(),
    bullets: z.array(z.object({ text: z.string() })),
  }),
});

const media = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/media' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['tv', 'podcast', 'article', 'other']),
    date: z.coerce.date(),
    url: z.string(),
    image: z.string().optional(),
    description: z.string().optional(),
  }),
});

const courses = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/courses' }),
  schema: z.object({
    title: z.string(),
    format: z.string(),
    contactLink: z.string(),
    image: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    author: z.string(),
    quote: z.string(),
    source: z.string().optional(),
  }),
});

const partnerLogos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/partner_logos' }),
  schema: z.object({
    name: z.string(),
    logo: z.string(),
  }),
});

export const collections = {
  settings,
  about,
  organizations,
  media,
  courses,
  testimonials,
  partner_logos: partnerLogos,
};
```

- [ ] **Step 2: Create `src/content/settings/settings.md`**

```markdown
---
title: "מעיין בשן"
tagline: "לקרוא אנשים כמו ספר פתוח"
heroImage: "/images/placeholder-hero.svg"
shortBio: "מומחית שפת גוף, מרצה ופרשנית תקשורת לא מילולית."
phone: "050-0000000"
email: "info@maayanbashan.co.il"
instagram: "https://www.instagram.com/maayan.bashan/"
tiktok: "https://www.tiktok.com/@maayan.bashan"
facebook: "https://www.facebook.com/sfatgoof1/"
---
```

- [ ] **Step 3: Create `src/content/about/about.md`**

```markdown
---
title: "קצת עליי"
---
כאן ייכתב הסיפור האישי והמקצועי של מעיין. תוכן זה הוא Placeholder ויוחלף דרך פאנל הניהול.
```

- [ ] **Step 4: Create `src/content/organizations/organizations.md`**

```markdown
---
title: "הרצאות וסדנאות לארגונים"
bullets:
  - text: "הרצאות אירוע לחברות וגופים"
  - text: "סדנאות מעשיות לעובדים ומנהלים"
  - text: "ייעוץ תקשורת לא מילולית"
---
מעיין מציעה תוכן מותאם אישית לארגונים. תוכן זה הוא Placeholder ויוחלף דרך פאנל הניהול.
```

- [ ] **Step 5: Create `src/content/media/example-media-item.md`**

```markdown
---
title: "ראיון בתוכנית הבוקר"
category: "tv"
date: 2026-01-01
url: "https://example.com"
description: "פריט לדוגמה - יוחלף בתוכן אמיתי דרך פאנל הניהול."
---
```

- [ ] **Step 6: Create `src/content/courses/example-course.md`**

```markdown
---
title: "מה הגוף שלנו מספר עלינו"
format: "הרצאה בת שעה וחצי"
contactLink: "/contact"
featured: true
---
תיאור לדוגמה - יוחלף בתוכן אמיתי דרך פאנל הניהול.
```

- [ ] **Step 7: Create `src/content/testimonials/example-testimonial.md`**

```markdown
---
author: "לקוחה לדוגמה"
quote: "הרצאה מרתקת ומעוררת מחשבה - זהו ציטוט לדוגמה שיוחלף בתוכן אמיתי."
---
```

- [ ] **Step 8: Create `src/content/partner_logos/example-logo.md`**

```markdown
---
name: "גוף לדוגמה"
logo: "/images/logos/placeholder-logo.svg"
---
```

- [ ] **Step 9: Create `public/images/placeholder-hero.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" rx="200" fill="#f5a623" opacity="0.25" />
  <circle cx="200" cy="180" r="120" fill="#faf3e8" />
  <text x="200" y="190" font-size="20" text-anchor="middle" fill="#2f7d6e" font-family="sans-serif">תמונת מעיין</text>
</svg>
```

- [ ] **Step 10: Create `public/images/logos/placeholder-logo.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48">
  <rect width="160" height="48" fill="none" />
  <text x="80" y="30" font-size="14" text-anchor="middle" fill="#faf3e8" font-family="sans-serif">לוגו</text>
</svg>
```

- [ ] **Step 11: Verify the config parses (no pages exist yet, so use a type check)**

Run: `npx astro sync`
Expected: exits 0 and prints that types were generated, no schema errors.

- [ ] **Step 12: Commit**

```bash
git add src/content public/images
git commit -m "Add content collections schema and placeholder content"
```

---

### Task 4: Base layout, navigation, footer

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/Nav.astro`
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create `src/components/Nav.astro`**

```astro
---
const links = [
  { href: '/', label: 'בית' },
  { href: '/about', label: 'אודות' },
  { href: '/media', label: 'תקשורת' },
  { href: '/courses', label: 'הרצאות וקורסים' },
  { href: '/organizations', label: 'ארגונים' },
  { href: '/contact', label: 'צור קשר' },
];
---
<header class="site-nav">
  <a href="/" class="brand">מעיין בשן</a>
  <nav>
    <ul>
      {links.map((link) => (
        <li><a href={link.href}>{link.label}</a></li>
      ))}
    </ul>
  </nav>
</header>
<style>
  .site-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: var(--color-cream);
  }
  .brand {
    font-weight: 700;
    font-size: 1.25rem;
    color: var(--color-teal);
    text-decoration: none;
  }
  nav ul {
    display: flex;
    gap: 1.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  nav a {
    color: var(--color-text);
    text-decoration: none;
    font-weight: 600;
  }
  nav a:hover {
    color: var(--color-orange);
  }
  @media (max-width: 640px) {
    .site-nav { flex-direction: column; gap: 1rem; }
    nav ul { flex-wrap: wrap; justify-content: center; gap: 1rem; }
  }
</style>
```

- [ ] **Step 2: Create `src/components/Footer.astro`**

```astro
---
import { getEntry } from 'astro:content';
const settings = await getEntry('settings', 'settings');
---
<footer class="site-footer">
  <p>© {new Date().getFullYear()} מעיין בשן. כל הזכויות שמורות.</p>
  <div class="socials">
    {settings?.data.instagram && <a href={settings.data.instagram} target="_blank" rel="noopener">אינסטגרם</a>}
    {settings?.data.tiktok && <a href={settings.data.tiktok} target="_blank" rel="noopener">טיקטוק</a>}
    {settings?.data.facebook && <a href={settings.data.facebook} target="_blank" rel="noopener">פייסבוק</a>}
  </div>
</footer>
<style>
  .site-footer {
    padding: 2rem;
    text-align: center;
    background: var(--color-teal);
    color: white;
  }
  .socials {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 0.5rem;
  }
  .socials a {
    color: white;
    text-decoration: underline;
  }
</style>
```

- [ ] **Step 3: Create `src/layouts/BaseLayout.astro`**

```astro
---
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}
const { title, description = 'מעיין בשן - מומחית שפת גוף' } = Astro.props;
---
<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} | מעיין בשן</title>
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <Nav />
    <main>
      <slot />
    </main>
    <Footer />
    <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
    <script>
      if (window.netlifyIdentity) {
        window.netlifyIdentity.on('init', (user) => {
          if (!user) {
            window.netlifyIdentity.on('login', () => {
              document.location.href = '/admin/';
            });
          }
        });
      }
    </script>
  </body>
</html>
```

- [ ] **Step 4: Commit**

```bash
git add src/layouts src/components
git commit -m "Add base layout, nav, and footer"
```

---

### Task 5: Homepage

**Files:**
- Create: `src/components/Hero.astro`
- Create: `src/components/PartnerLogos.astro`
- Create: `src/components/Testimonials.astro`
- Create: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/Hero.astro`**

```astro
---
import { getEntry } from 'astro:content';
const settings = await getEntry('settings', 'settings');
---
<section class="hero">
  <div class="hero-text">
    <h1>{settings?.data.tagline}</h1>
    <p>{settings?.data.shortBio}</p>
    <a class="cta" href="/contact">בואו נדבר</a>
  </div>
  {settings?.data.heroImage && (
    <div class="hero-image">
      <img src={settings.data.heroImage} alt="מעיין בשן" />
    </div>
  )}
</section>
<style>
  .hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    padding: 3rem 2rem;
    background: var(--color-cream);
  }
  .hero-text { max-width: 480px; }
  .hero-text h1 { font-size: 2.25rem; color: var(--color-teal); }
  .cta {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: var(--color-orange);
    color: white;
    text-decoration: none;
    border-radius: 999px;
    font-weight: 700;
  }
  .hero-image img {
    max-width: 340px;
    border-radius: 50%;
  }
  @media (max-width: 768px) {
    .hero { flex-direction: column; text-align: center; }
  }
</style>
```

- [ ] **Step 2: Create `src/components/PartnerLogos.astro`**

```astro
---
import { getCollection } from 'astro:content';
const logos = await getCollection('partner_logos');
---
{logos.length > 0 && (
  <section class="partner-logos">
    <h2>כפי שהופיעה ב</h2>
    <div class="logos-grid">
      {logos.map((logo) => (
        <img src={logo.data.logo} alt={logo.data.name} loading="lazy" />
      ))}
    </div>
  </section>
)}
<style>
  .partner-logos {
    padding: 2rem;
    text-align: center;
    background: #1c1c1c;
  }
  .partner-logos h2 { color: white; margin-bottom: 1.5rem; font-size: 1.1rem; }
  .logos-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 2rem;
  }
  .logos-grid img { height: 48px; filter: grayscale(1) brightness(2); }
</style>
```

- [ ] **Step 3: Create `src/components/Testimonials.astro`**

```astro
---
import { getCollection } from 'astro:content';
const testimonials = await getCollection('testimonials');
---
{testimonials.length > 0 && (
  <section class="testimonials">
    <h2>מה אומרים עליי</h2>
    <div class="testimonials-grid">
      {testimonials.map((t) => (
        <blockquote>
          <p>{t.data.quote}</p>
          <cite>— {t.data.author}</cite>
        </blockquote>
      ))}
    </div>
  </section>
)}
<style>
  .testimonials { padding: 3rem 2rem; background: white; text-align: center; }
  .testimonials h2 { color: var(--color-teal); margin-bottom: 2rem; }
  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    max-width: 960px;
    margin: 0 auto;
  }
  blockquote {
    margin: 0;
    padding: 1.5rem;
    background: var(--color-cream);
    border-radius: 12px;
  }
  cite { display: block; margin-top: 0.75rem; font-weight: 700; color: var(--color-orange); font-style: normal; }
</style>
```

- [ ] **Step 4: Create `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import PartnerLogos from '../components/PartnerLogos.astro';
import Testimonials from '../components/Testimonials.astro';
import { getEntry, getCollection } from 'astro:content';

const about = await getEntry('about', 'about');
const courses = await getCollection('courses');
const featuredCourse = courses.find((c) => c.data.featured) ?? courses[0];
---
<BaseLayout title="בית">
  <Hero />
  <PartnerLogos />
  <section class="about-teaser">
    <h2>קצת עליי</h2>
    <p>{about?.data.title}</p>
    <a href="/about">לקריאת הסיפור המלא</a>
  </section>
  {featuredCourse && (
    <section class="course-teaser">
      <h2>הרצאה קרובה</h2>
      <h3>{featuredCourse.data.title}</h3>
      <a href="/courses">לכל ההרצאות והקורסים</a>
    </section>
  )}
  <Testimonials />
</BaseLayout>
<style>
  .about-teaser, .course-teaser {
    padding: 2.5rem 2rem;
    text-align: center;
  }
  .about-teaser { background: white; }
  .course-teaser { background: var(--color-cream); }
</style>
```

- [ ] **Step 5: Verify the homepage builds and renders**

Run: `npm run dev`
Then open `http://localhost:4321/` in a browser.
Expected: page loads with hero, "כפי שהופיעה ב" logo strip, about teaser, course teaser, and testimonials — all in Hebrew RTL, no console errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/Hero.astro src/components/PartnerLogos.astro src/components/Testimonials.astro src/pages/index.astro
git commit -m "Build homepage: hero, partner logos, about/course teasers, testimonials"
```

---

### Task 6: About page

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: Create `src/pages/about.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getEntry, render } from 'astro:content';

const about = await getEntry('about', 'about');
const { Content } = about ? await render(about) : { Content: null };
---
<BaseLayout title="אודות" description="קצת עליי - מעיין בשן, מומחית שפת גוף">
  <section class="about-page">
    <h1>{about?.data.title}</h1>
    <div class="content">
      {Content && <Content />}
    </div>
  </section>
</BaseLayout>
<style>
  .about-page { max-width: 720px; margin: 0 auto; padding: 3rem 2rem; }
  .about-page h1 { color: var(--color-teal); }
  .content :global(p) { line-height: 1.8; margin-bottom: 1rem; }
</style>
```

- [ ] **Step 2: Verify**

Run: `npm run dev`, open `http://localhost:4321/about`.
Expected: heading "קצת עליי" and placeholder body text render, RTL, no console errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "Add about page"
```

---

### Task 7: Media page

**Files:**
- Create: `src/pages/media.astro`

- [ ] **Step 1: Create `src/pages/media.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const mediaItems = (await getCollection('media')).sort(
  (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
);

const categoryLabels: Record<string, string> = {
  tv: 'טלוויזיה',
  podcast: 'פודקאסטים',
  article: 'כתבות ופינות',
  other: 'אחר',
};
---
<BaseLayout title="תקשורת" description="אזכורים תקשורתיים של מעיין בשן">
  <section class="media-page">
    <h1>תקשורת</h1>
    <div class="filters">
      <button data-filter="all" class="active">הכל</button>
      {Object.entries(categoryLabels).map(([key, label]) => (
        <button data-filter={key}>{label}</button>
      ))}
    </div>
    <div class="media-grid">
      {mediaItems.map((item) => (
        <a class="media-card" data-category={item.data.category} href={item.data.url} target="_blank" rel="noopener">
          {item.data.image && <img src={item.data.image} alt={item.data.title} />}
          <span class="category-tag">{categoryLabels[item.data.category]}</span>
          <h3>{item.data.title}</h3>
          {item.data.description && <p>{item.data.description}</p>}
        </a>
      ))}
    </div>
  </section>
</BaseLayout>
<style>
  .media-page { max-width: 1100px; margin: 0 auto; padding: 3rem 2rem; }
  .media-page h1 { color: var(--color-teal); text-align: center; margin-bottom: 2rem; }
  .filters { display: flex; justify-content: center; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap; }
  .filters button {
    padding: 0.5rem 1.25rem;
    border-radius: 999px;
    border: 2px solid var(--color-teal);
    background: white;
    color: var(--color-teal);
    font-weight: 600;
    cursor: pointer;
  }
  .filters button.active { background: var(--color-teal); color: white; }
  .media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.5rem;
  }
  .media-card {
    display: block;
    padding: 1rem;
    border-radius: 12px;
    background: var(--color-cream);
    text-decoration: none;
    color: var(--color-text);
  }
  .media-card img { width: 100%; border-radius: 8px; margin-bottom: 0.75rem; }
  .category-tag { font-size: 0.75rem; color: var(--color-orange); font-weight: 700; }
</style>
<script>
  const buttons = document.querySelectorAll<HTMLButtonElement>('.filters button');
  const cards = document.querySelectorAll<HTMLElement>('.media-card');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;
      cards.forEach((card) => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.display = show ? 'block' : 'none';
      });
    });
  });
</script>
```

- [ ] **Step 2: Verify filter behavior**

Run: `npm run dev`, open `http://localhost:4321/media`.
Expected: the one example media card shows under "הכל" and under "טלוויזיה", and disappears when clicking "פודקאסטים"/"כתבות ופינות"/"אחר". Active button gets highlighted style.

- [ ] **Step 3: Commit**

```bash
git add src/pages/media.astro
git commit -m "Add media page with category filter"
```

---

### Task 8: Courses & Lectures page

**Files:**
- Create: `src/pages/courses.astro`

- [ ] **Step 1: Create `src/pages/courses.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getCollection, render } from 'astro:content';

const courses = await getCollection('courses');
const renderedCourses = await Promise.all(
  courses.map(async (course) => ({ course, Content: (await render(course)).Content }))
);
---
<BaseLayout title="הרצאות וקורסים" description="הרצאות וקורסים של מעיין בשן">
  <section class="courses-page">
    <h1>הרצאות וקורסים</h1>
    <div class="courses-list">
      {renderedCourses.map(({ course, Content }) => (
        <article class="course-card">
          {course.data.image && <img src={course.data.image} alt={course.data.title} />}
          <div class="course-body">
            <h2>{course.data.title}</h2>
            <p class="format">{course.data.format}</p>
            <div class="description"><Content /></div>
            <a class="contact-cta" href={course.data.contactLink}>ליצירת קשר להרשמה</a>
          </div>
        </article>
      ))}
    </div>
  </section>
</BaseLayout>
<style>
  .courses-page { max-width: 900px; margin: 0 auto; padding: 3rem 2rem; }
  .courses-page h1 { color: var(--color-teal); text-align: center; margin-bottom: 2rem; }
  .course-card {
    display: flex;
    gap: 1.5rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    background: var(--color-cream);
    border-radius: 12px;
  }
  .course-card img { width: 160px; height: 160px; object-fit: cover; border-radius: 8px; }
  .format { color: var(--color-orange); font-weight: 700; }
  .contact-cta {
    display: inline-block;
    margin-top: 0.75rem;
    padding: 0.5rem 1.25rem;
    background: var(--color-teal);
    color: white;
    border-radius: 999px;
    text-decoration: none;
    font-weight: 700;
  }
  @media (max-width: 640px) {
    .course-card { flex-direction: column; }
    .course-card img { width: 100%; height: auto; }
  }
</style>
```

- [ ] **Step 2: Verify**

Run: `npm run dev`, open `http://localhost:4321/courses`.
Expected: example course card renders with title, format, description body, and a "ליצירת קשר להרשמה" link pointing at `/contact`. No booking/payment UI present (confirms spec's "info only" requirement).

- [ ] **Step 3: Commit**

```bash
git add src/pages/courses.astro
git commit -m "Add courses and lectures page"
```

---

### Task 9: Organizations page + business contact form

**Files:**
- Create: `src/pages/organizations.astro`

- [ ] **Step 1: Create `src/pages/organizations.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getEntry, render } from 'astro:content';

const org = await getEntry('organizations', 'organizations');
const { Content } = org ? await render(org) : { Content: null };
---
<BaseLayout title="ארגונים" description="הרצאות וסדנאות לארגונים וחברות">
  <section class="organizations-page">
    <h1>{org?.data.title}</h1>
    <div class="content">{Content && <Content />}</div>
    {org?.data.bullets && (
      <ul class="bullets">
        {org.data.bullets.map((b) => <li>{b.text}</li>)}
      </ul>
    )}
  </section>
  <section class="business-contact">
    <h2>מעוניינים לארגון שלכם?</h2>
    <form name="business-contact" method="POST" data-netlify="true" netlify-honeypot="bot-field">
      <input type="hidden" name="form-name" value="business-contact" />
      <p class="hidden-field"><label>אל תמלאו שדה זה: <input name="bot-field" /></label></p>
      <label>שם מלא<input type="text" name="name" required /></label>
      <label>שם הארגון<input type="text" name="company" required /></label>
      <label>טלפון<input type="tel" name="phone" required /></label>
      <label>מייל<input type="email" name="email" required /></label>
      <label>פרטים נוספים<textarea name="message" rows="4"></textarea></label>
      <button type="submit">שליחה</button>
    </form>
  </section>
</BaseLayout>
<style>
  .organizations-page, .business-contact { max-width: 720px; margin: 0 auto; padding: 3rem 2rem; }
  .organizations-page h1 { color: var(--color-teal); }
  .bullets { padding-inline-start: 1.25rem; line-height: 1.8; }
  .business-contact { background: var(--color-cream); border-radius: 12px; }
  .business-contact h2 { color: var(--color-teal); text-align: center; }
  form { display: flex; flex-direction: column; gap: 1rem; }
  label { display: flex; flex-direction: column; gap: 0.35rem; font-weight: 600; }
  input, textarea { padding: 0.6rem; border-radius: 8px; border: 1px solid #ccc; font-family: inherit; }
  .hidden-field { display: none; }
  button[type="submit"] {
    padding: 0.75rem;
    background: var(--color-orange);
    color: white;
    border: none;
    border-radius: 999px;
    font-weight: 700;
    cursor: pointer;
  }
</style>
```

- [ ] **Step 2: Verify markup and required-field validation**

Run: `npm run dev`, open `http://localhost:4321/organizations`.
Expected: bullets render, form shows 5 visible fields + hidden honeypot. Click "שליחה" with empty fields — browser native validation blocks submit on the 4 required fields.

- [ ] **Step 3: Commit**

```bash
git add src/pages/organizations.astro
git commit -m "Add organizations page with business contact form"
```

---

### Task 10: Contact page + general contact form

**Files:**
- Create: `src/pages/contact.astro`

- [ ] **Step 1: Create `src/pages/contact.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getEntry } from 'astro:content';

const settings = await getEntry('settings', 'settings');
---
<BaseLayout title="צור קשר" description="יצירת קשר עם מעיין בשן">
  <section class="contact-page">
    <h1>בואו נדבר</h1>
    <div class="contact-info">
      <p>טלפון: <a href={`tel:${settings?.data.phone}`}>{settings?.data.phone}</a></p>
      <p>מייל: <a href={`mailto:${settings?.data.email}`}>{settings?.data.email}</a></p>
      <div class="socials">
        {settings?.data.instagram && <a href={settings.data.instagram} target="_blank" rel="noopener">אינסטגרם</a>}
        {settings?.data.tiktok && <a href={settings.data.tiktok} target="_blank" rel="noopener">טיקטוק</a>}
        {settings?.data.facebook && <a href={settings.data.facebook} target="_blank" rel="noopener">פייסבוק</a>}
      </div>
    </div>
    <form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field">
      <input type="hidden" name="form-name" value="contact" />
      <p class="hidden-field"><label>אל תמלאו שדה זה: <input name="bot-field" /></label></p>
      <label>שם מלא<input type="text" name="name" required /></label>
      <label>טלפון<input type="tel" name="phone" required /></label>
      <label>מייל<input type="email" name="email" required /></label>
      <label>הודעה<textarea name="message" rows="4" required></textarea></label>
      <button type="submit">שליחה</button>
    </form>
  </section>
</BaseLayout>
<style>
  .contact-page { max-width: 640px; margin: 0 auto; padding: 3rem 2rem; }
  .contact-page h1 { color: var(--color-teal); text-align: center; }
  .contact-info { text-align: center; margin-bottom: 2rem; }
  .socials { display: flex; justify-content: center; gap: 1rem; margin-top: 0.5rem; }
  form { display: flex; flex-direction: column; gap: 1rem; }
  label { display: flex; flex-direction: column; gap: 0.35rem; font-weight: 600; }
  input, textarea { padding: 0.6rem; border-radius: 8px; border: 1px solid #ccc; font-family: inherit; }
  .hidden-field { display: none; }
  button[type="submit"] {
    padding: 0.75rem;
    background: var(--color-teal);
    color: white;
    border: none;
    border-radius: 999px;
    font-weight: 700;
    cursor: pointer;
  }
</style>
```

- [ ] **Step 2: Verify**

Run: `npm run dev`, open `http://localhost:4321/contact`.
Expected: phone/email/social links render from `settings.md` data, form shows 4 visible fields + honeypot, required-field validation blocks empty submit.

- [ ] **Step 3: Full site smoke check**

Run: `npm run build`
Expected: exits 0, `dist/` contains `index.html`, `about/index.html`, `media/index.html`, `courses/index.html`, `organizations/index.html`, `contact/index.html`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/contact.astro
git commit -m "Add contact page with general contact form"
```

---

### Task 11: Decap CMS admin panel

**Files:**
- Create: `public/admin/index.html`
- Create: `public/admin/config.yml`

- [ ] **Step 1: Create `public/admin/config.yml`**

```yaml
backend:
  name: git-gateway
  branch: main

media_folder: "public/images/uploads"
public_folder: "/images/uploads"

collections:
  - name: "settings"
    label: "הגדרות אתר"
    files:
      - file: "src/content/settings/settings.md"
        name: "settings"
        label: "הגדרות כלליות"
        fields:
          - {label: "כותרת האתר", name: "title", widget: "string"}
          - {label: "טאגליין", name: "tagline", widget: "string"}
          - {label: "תמונת הירו", name: "heroImage", widget: "image"}
          - {label: "ביו קצר", name: "shortBio", widget: "text"}
          - {label: "טלפון", name: "phone", widget: "string"}
          - {label: "מייל", name: "email", widget: "string"}
          - {label: "אינסטגרם", name: "instagram", widget: "string", required: false}
          - {label: "טיקטוק", name: "tiktok", widget: "string", required: false}
          - {label: "פייסבוק", name: "facebook", widget: "string", required: false}
  - name: "about"
    label: "אודות"
    files:
      - file: "src/content/about/about.md"
        name: "about"
        label: "תוכן אודות"
        fields:
          - {label: "כותרת", name: "title", widget: "string"}
          - {label: "תוכן", name: "body", widget: "markdown"}
  - name: "media"
    label: "תקשורת"
    folder: "src/content/media"
    create: true
    slug: "{{slug}}"
    fields:
      - {label: "כותרת", name: "title", widget: "string"}
      - label: "קטגוריה"
        name: "category"
        widget: "select"
        options:
          - {label: "טלוויזיה", value: "tv"}
          - {label: "פודקאסט", value: "podcast"}
          - {label: "כתבה/פינה", value: "article"}
          - {label: "אחר", value: "other"}
      - {label: "תאריך", name: "date", widget: "datetime"}
      - {label: "קישור חיצוני", name: "url", widget: "string"}
      - {label: "תמונה", name: "image", widget: "image", required: false}
      - {label: "תיאור קצר", name: "description", widget: "text", required: false}
  - name: "courses"
    label: "הרצאות וקורסים"
    folder: "src/content/courses"
    create: true
    slug: "{{slug}}"
    fields:
      - {label: "כותרת", name: "title", widget: "string"}
      - {label: "תיאור", name: "body", widget: "markdown"}
      - {label: "פורמט", name: "format", widget: "string"}
      - {label: "קישור/טלפון ליצירת קשר", name: "contactLink", widget: "string"}
      - {label: "תמונה", name: "image", widget: "image", required: false}
      - {label: "מוצג בדף הבית", name: "featured", widget: "boolean", default: false}
  - name: "organizations"
    label: "ארגונים"
    files:
      - file: "src/content/organizations/organizations.md"
        name: "organizations"
        label: "תוכן דף ארגונים"
        fields:
          - {label: "כותרת", name: "title", widget: "string"}
          - {label: "תוכן", name: "body", widget: "markdown"}
          - label: "נקודות עיקריות"
            name: "bullets"
            widget: "list"
            field: {label: "נקודה", name: "text", widget: "string"}
  - name: "testimonials"
    label: "המלצות"
    folder: "src/content/testimonials"
    create: true
    slug: "{{slug}}"
    fields:
      - {label: "שם הממליץ/ה", name: "author", widget: "string"}
      - {label: "ציטוט", name: "quote", widget: "text"}
      - {label: "תמונה/מקור", name: "source", widget: "string", required: false}
  - name: "partner_logos"
    label: "לוגואים - כפי שהופיעה ב"
    folder: "src/content/partner_logos"
    create: true
    slug: "{{slug}}"
    fields:
      - {label: "שם הגוף", name: "name", widget: "string"}
      - {label: "לוגו", name: "logo", widget: "image"}
```

- [ ] **Step 2: Create `public/admin/index.html`**

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ניהול תוכן - מעיין בשן</title>
    <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
  </head>
  <body>
    <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
    <script>
      if (window.netlifyIdentity) {
        window.netlifyIdentity.on('init', (user) => {
          if (!user) {
            window.netlifyIdentity.on('login', () => {
              document.location.href = '/admin/';
            });
          }
        });
      }
    </script>
  </body>
</html>
```

- [ ] **Step 3: Verify config.yml is valid YAML**

Run: `node -e "require('js-yaml') ? null : null" 2>/dev/null; npx -y js-yaml public/admin/config.yml > /dev/null && echo OK`
Expected: prints `OK` (no YAML syntax errors). If `js-yaml` CLI isn't available, paste the file contents into a YAML validator instead — the goal is confirming no indentation/syntax errors before relying on Decap CMS to parse it.

- [ ] **Step 4: Commit**

```bash
git add public/admin
git commit -m "Add Decap CMS admin panel and content model config"
```

**Note:** the CMS panel will show a "connection failed" error until Netlify Identity + Git Gateway are enabled on the deployed site (manual dashboard steps — see Task 12).

---

### Task 12: Netlify config, README, and deployment instructions

**Files:**
- Create: `netlify.toml`
- Create: `README.md`
- Modify: `astro.config.mjs` (replace placeholder domain — final step, after DNS is known)

- [ ] **Step 1: Create `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

- [ ] **Step 2: Create `README.md`**

```markdown
# אתר מעיין בשן

## פיתוח מקומי

\`\`\`bash
npm install
npm run dev
\`\`\`

האתר יעלה בכתובת http://localhost:4321

## פריסה (Netlify) - שלבים חד-פעמיים

1. העלו את הריפו הזה ל-GitHub (או GitLab/Bitbucket).
2. ב-Netlify: "Add new site" → "Import an existing project" → חברו את הריפו.
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **הפעלת Netlify Identity** (נדרש כדי שמעיין תוכל להתחבר לפאנל הניהול):
   - Site settings → Identity → Enable Identity
   - Identity → Registration → הגבילו ל-"Invite only"
   - Identity → Services → Git Gateway → Enable Git Gateway
4. הזמינו את מעיין כמשתמשת: Identity → Invite users → הזינו את המייל שלה. היא תקבל מייל הזמנה, תגדיר סיסמה, ומאותו רגע תוכל להתחבר בכתובת `https://<הדומיין>/admin`.
5. **חיבור הדומיין הקיים:**
   - Domain settings → Add a domain → הזינו את הדומיין הקיים.
   - Netlify יציג רשומות DNS (CNAME/A) - עדכנו אותן אצל ספק הדומיין.
   - המתינו להטמעת תעודת ה-SSL האוטומטית (בדרך כלל עד שעה).
6. אחרי שהדומיין הסופי מחובר, עדכנו את `site` ב-`astro.config.mjs` לדומיין האמיתי (ראו שלב הבא במשימה זו) ועשו commit.

## עריכת תוכן

מעיין נכנסת ל-`/admin`, מתחברת, ועורכת: הגדרות כלליות, אודות, תקשורת, הרצאות וקורסים, ארגונים, המלצות, ולוגואים. כל שמירה יוצרת commit ומפעילה דיפלוי אוטומטי (כדקה עד שהשינוי עולה לאוויר).
```

- [ ] **Step 3: Modify `astro.config.mjs`** — replace the placeholder domain once the real one is known

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://REPLACE-WITH-REAL-DOMAIN',
});
```

This step is intentionally left as a manual edit at deploy time — the real domain isn't known until Task 12 Step 2's DNS instructions are followed against the client's actual registrar.

- [ ] **Step 4: Verify build still passes**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add netlify.toml README.md
git commit -m "Add Netlify config and deployment README"
```

---

### Task 13: Final QA pass

**Files:** none (verification only)

- [ ] **Step 1: Full production build**

Run: `npm run build && npm run preview`
Expected: build exits 0, preview server starts, no console errors on any of the 6 pages.

- [ ] **Step 2: Manual RTL/responsive checklist**

For each of `/`, `/about`, `/media`, `/courses`, `/organizations`, `/contact`, at both a desktop width (1280px) and a mobile width (375px):
- Text reads right-to-left, nav order is right-to-left.
- No horizontal scrollbar.
- Nav links all work and highlight correctly on hover.
- Forms on `/organizations` and `/contact` submit-block on empty required fields.

- [ ] **Step 3: Empty-collection check**

Temporarily rename `src/content/testimonials/example-testimonial.md` to `.bak`, run `npm run dev`, confirm the testimonials section disappears from the homepage with no empty box/heading left behind (validates the spec's "hide empty sections" edge case). Rename it back afterward.

- [ ] **Step 4: Brand color swap (once real brand assets arrive)**

When Meayan's actual logo/photos/brand hex codes are available: update the 5 CSS custom properties in `src/styles/global.css` (Task 2) to the exact values, and replace the placeholder SVGs (`public/images/placeholder-hero.svg`, `public/images/logos/placeholder-logo.svg`, `public/favicon.svg`) and example content image paths with the real files.

- [ ] **Step 5: Commit final QA notes**

```bash
git add -A
git commit -m "Final QA pass for MVP site" --allow-empty
```

---

## Out of scope (confirmed in spec)

- Online registration/payment for courses
- Multi-language support
- Blog/newsletter
- Advanced analytics
