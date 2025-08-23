---
title: "Building vitosenic.com — My Minimalist Personal Site"
slug: "2025-08-23_building-vitosenic-site"
date: "2025-08-23"
summary: "How I built my personal website vitosenic.com — minimalistic design, projects, notes, and my own AI-powered chat."
lead: "I wanted a personal site that’s more than a static portfolio. This is the story of how I designed and built vitosenic.com: from minimal design choices to integrating my own RAG-powered AI chat."
tags: ["personal-website", "nextjs", "ai-chat", "supabase", "rag"]
cover: "/images/2025-05-14_hello-world.jpeg"
canonical: "https://vitosenic.com/notes/2025-08-23_building-vitosenic-site"
---

## Why I built this site
I didn’t want a generic portfolio page.  
Most student or junior websites look the same: name, CV, GitHub links, maybe a couple of projects.  
I wanted something different — a place where I could **share projects, notes, and let people talk directly with an AI version of me**.

---

## Tech stack
I went with **Next.js + Tailwind** for the frontend.  
For data, I use **Supabase** as both the database and the vector store (pgvector) to power my RAG pipeline.  
The AI chat runs on **OpenAI models** (tested with GPT-4.1-mini for speed), and embeddings are updated automatically when I add new content (projects, notes, or CV data).

---

## Minimalist design
I kept the design clean:
- No clutter, no animations for the sake of animations.
- One landing page with just my name, what I do, links to projects, notes, socials — and the **chat**.
- I wanted visitors to feel they can *immediately interact*, not just scroll.

---

## The AI chat
This is the part I’m most proud of.  
The chat isn’t just a toy — it’s a personalized assistant trained on:
- My **CV data** (experience, skills, roadmap, etc.)
- My **projects** (from `projects.json`)
- My **notes/blog posts** (chunked by headings for precision)

The goal was to make it feel like you’re talking to me, but **grounded strictly in my own data**.  
No hallucinated nonsense, no fake projects.  

If the context is missing, the bot falls back with:  
*“I haven’t shared that yet, but you can reach me directly at vito.senic@gmail.com.”*

---

## Lessons learned
- Keeping data **structured in JSON** (CV, projects) makes embedding + RAG pipelines much cleaner.
- **Chunking matters.** Each project, each section of my CV, and each blog heading is its own chunk for better retrieval.
- Prompt engineering is 50% of the work. A bad system prompt = bad answers, no matter how good the data is.
- Minimalistic design doesn’t mean boring. With the right focus (projects + chat), the site feels alive.

---

## What’s next
- Adding more **case studies** to my notes (so the AI can explain them directly).
- Iterating on the **chat UX** (live typing effect, better UI).
- Using the site as my **public lab notebook** — building in public, but also training my AI model of me.

👉 You can check the live site here: [vitosenic.com](https://vitosenic.com).  
