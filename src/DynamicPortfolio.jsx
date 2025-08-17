import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// shadcn/ui (make sure you've run: npx shadcn-ui@latest add button card badge dialog progress tabs input)
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { Progress } from "./components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

import { ChevronDown, FileDown, Linkedin, Mail, Menu, Phone, X } from "lucide-react";

// PDF.js
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?worker&url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Dynamic, animated portfolio that auto-parses a PDF resume on the client.
 * - Upload a PDF ➜ parsed into sections (About, Education, Experience, Skills, Projects)
 * - Smooth transitions, parallax, and micro-interactions
 * - Mobile-first responsive design with Tailwind + shadcn/ui + Framer Motion
 */
export default function DynamicPortfolio() {
  const [parsed, setParsed] = useState(null);
  const [navOpen, setNavOpen] = useState(false);

  // Parallax for hero
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacityParallax = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  // Fallback (useful before upload or if parsing fails)
  const fallbackData = useMemo(
    () => ({
      name: "Sagar Pagad",
      role: "Senior Software Engineer",
      contact: {
        phone: "+91-9591833578",
        email: "sagarpagad38@gmail.com",
        linkedin: "https://www.linkedin.com/in/sagar-pagad/",
      },
      about:
        "Software Engineer with experience at Samsung R&D India (Noida) and SecPod (Bengaluru). Focused on backend with Python/Django, Android (Kotlin), and systems scripting. Built watch faces for Galaxy Watch, stabilized Bixby capsules, and developed secure, scalable web services.",
      education: [
        {
          degree: "B.E. in Electronics & Communication (ECE)",
          institute: "M S Ramaiah Institute of Technology, Bengaluru",
          period: "2018 – 2022",
          score: "CGPA 8.73",
        },
      ],
      experience: [
        {
          title: "Senior Software Engineer",
          company: "UnitedHealthGroup-Optum",
          period: "April 2025 – Present",
          bullets: [
            "Backend development for SGG Software using Python/Django (auth, product mgmt, payments).",
            "Dynamic Galaxy Watch faces in Kotlin with time-based animations and performance tuning.",
            "Stabilized Bixby capsule for Samsung Global Goals using C/C++ and API modernization.",
            "Researched NFT wallet auth & transaction recording on smartwatch for Global Goals.",
          ],
          tags: ["Python", "Django", "FastApi", "MSSQL", "C/C++", "Git-CI/CD"],
        },
        {
          title: "Software Engineer",
          company: "Samsung R&D Institute India (Noida)",
          period: "Jul 2022 – Sep 2024",
          bullets: [
            "Backend development for SGG Software using Python/Django (auth, product mgmt, payments).",
            "Dynamic Galaxy Watch faces in Kotlin with time-based animations and performance tuning.",
            "Stabilized Bixby capsule for Samsung Global Goals using C/C++ and API modernization.",
            "Researched NFT wallet auth & transaction recording on smartwatch for Global Goals.",
          ],
          tags: ["Python", "Django", "Kotlin", "Android", "C/C++", "Bixby"],
        },
        {
          title: "Software Engineer",
          company: "SecPod Technologies (Bengaluru)",
          period: "Oct 2024 – Nov 2024",
          bullets: [
            "Automated redundant tasks with Python scripts; boosted efficiency.",
            "Provisioned and hosted servers on Proxmox for resource mgmt.",
            "Converted OVAL content across platforms; created DB compliance patches and rollbacks using PowerShell/Batch/Bash.",
          ],
          tags: ["Python", "Proxmox", "OVAL", "PowerShell", "Bash"],
        },
      ],
      projects: [
        {
          name: "E-Commerce Web App",
          summary:
            "Full-stack Django app with PostgreSQL, REST APIs (JWT), cart/checkout, and Celery+Redis for async tasks.",
          stack: ["Django", "PostgreSQL", "REST", "JWT", "Celery", "Redis", "HTML/CSS/Bootstrap"],
        },
        {
          name: "E-Voting on Blockchain",
          summary:
            "ReactJS + Django with Truffle, Ganache, MetaMask. Secure auth and improved UX for 1k+ users.",
          stack: ["React", "Django", "Truffle", "Ganache", "MetaMask"],
        },
        {
          name: "Galaxy Watch Faces (Android)",
          summary: "Kotlin watch faces with scheduled animations and efficient battery usage.",
          stack: ["Kotlin", "Android"],
        },
      ],
      skills: {
        Languages: ["Python", "C/C++", "Kotlin", "JavaScript (Basics)", "Solidity (Basics)"],
        Frameworks: ["Django (DRF)","FastApi","REST API", "ORM", "Celery", "Redis"],
        Databases: ["PostgreSQL", "MySQL"],
        Tooling: ["Linux", "AWS", "VS Code", "PyCharm", "Postman"],
        Data: ["NumPy", "Pandas"],
      },
      certificates: [
        "Samsung Competency Test",
        "Linux Basics & Shell Programming",
        "Python & Django (Udemy)",
        "HackerRank: Python, SQL, Problem Solving",
      ],
    }),
    []
  );

  // Heuristic PDF text parser
  function parseResume(text) {
    const t = text.replace(/\u00A0/g, " ").replace(/[\t\r]+/g, " ");

    const nameMatch = t.match(/\bSAGAR\s+PAGAD\b|\bSagar\s+Pagad\b/i);
    const name = nameMatch ? nameMatch[0].replace(/\s+/g, " ").trim() : fallbackData.name;

    const emailMatch = t.match(/[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/);
    const phoneMatch = t.match(/\+?\d[\d\-\s]{8,}/);
    const linkedinMatch = t.match(/https?:\/\/\S*linkedin\S*/i);

    const grab = (label) => {
      const rx = new RegExp(`${label}\\s*:?[\\n\\s]*([\\s\\S]*?)(?=\\n[A-Z][A-Z\\s:]{3,}|$)`, "i");
      const m = t.match(rx);
      return m ? m[1].trim() : "";
    };

    const workBlock = grab("WORK EXPERIENCE");
    const projectsBlock = grab("PROJECTS");
    const skillsBlock = grab("SKILLS");
    const eduBlock = grab("EDUCATION");
    const certBlock = grab("CERTIFICATES");

    // Experience
    const expEntries = [];
    const expRegex = /(Software\s+Engineer.*?)(?=\n\s*\n|\n\s*[A-Z][A-Z\s:]{3,}|$)/gis;
    let m;
    while ((m = expRegex.exec(workBlock))) {
      const chunk = m[1].replace(/\n+/g, "\n").trim();
      const header = chunk.split("\n")[0];
      const bullets = chunk
        .split("\n")
        .slice(1)
        .map((s) => s.replace(/^•\s*/, "").trim())
        .filter(Boolean);
      const period =
        (header.match(
          /(\b\w{3,}\s?\d{4}\b\s?[–-]\s?\w{3,}\s?\d{4}|\b\w{3,}\s?\d{4}\b\s?[–-]\s?\w{3,}|\d{4}\s?[–-]\s?\d{4}|\b\w{3}\.?\s?\d{4}\b.*)/
        ) || [""])[0]
          .replace(/\s+/g, " ")
          .trim();
      const headerNoPeriod = header.replace(period, "").trim();
      const [title, company] = headerNoPeriod.includes(":")
        ? headerNoPeriod.split(":").map((s) => s.trim())
        : headerNoPeriod.split(" - ");
      expEntries.push({
        title: title || "Software Engineer",
        company: company || "",
        period,
        bullets,
        tags: [],
      });
    }

    // Projects
    const projEntries = projectsBlock
      .split(/\n(?=\s*•|\s*[A-Za-z].*?:)/)
      .map((blk) => blk.trim())
      .filter(Boolean)
      .map((blk) => {
        const lines = blk.split("\n").map((s) => s.replace(/^•\s*/, "").trim());
        const header = lines[0] || "Project";
        const name = header.replace(/:.*$/, "").trim();
        const summary = lines.slice(1).join(" ");
        const stack =
          summary.match(/\b(Django|React|PostgreSQL|Redis|Celery|Kotlin|Android|Truffle|Ganache|MetaMask|JWT|REST)\b/gi) ||
          [];
        return { name, summary, stack: [...new Set(stack)] };
      });

    // Skills
    const buckets = { Languages: [], Frameworks: [], Databases: [], Tooling: [], Data: [] };
    if (skillsBlock) {
      const lines = skillsBlock.split(/\n+/).map((s) => s.trim());
      lines.forEach((line) => {
        const [k, v] = line.split(":");
        if (!k || !v) return;
        const key = k.trim();
        const items = v
          .split(/,|\u2022|·|•/)
          .map((s) => s.trim())
          .filter(Boolean);
        if (buckets[key]) buckets[key] = items;
        else buckets.Tooling.push(...items);
      });
    }

    // Education
    const eduEntries = [];
    eduBlock
      .split(/\n(?=\p{Extended_Pictographic}|\p{Lu}|\d|\s*•)/u)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((line) => {
        if (/Ramaiah|Institute|Bachelor|B\.?E\.?|CGPA/i.test(line)) {
          eduEntries.push({
            degree: line.match(/Bachelor.*?|B\.?E\.?\s.*?/i)?.[0] || "Bachelor of Engineering",
            institute: line.match(/M\s*S\s*Ramaiah.*?|Institute.*?/i)?.[0] || "",
            period: line.match(/\b(\d{4})\s?[–-]\s?(\d{4})\b/)?.[0] || "",
            score: line.match(/CGPA\s*[-:]?\s*\d+(\.\d+)?/i)?.[0] || "",
          });
        }
      });

    const about = `Experienced Software Engineer with strengths in Python/Django and Android (Kotlin). ${
      expEntries[0]?.company ? `Worked at ${expEntries[0].company}.` : ""
    }`;

    const contact = {
      email: emailMatch?.[0] || fallbackData.contact.email,
      phone: phoneMatch?.[0]?.replace(/\s+/g, " ") || fallbackData.contact.phone,
      linkedin: linkedinMatch?.[0] || fallbackData.contact.linkedin,
    };

    return {
      name,
      role: fallbackData.role,
      contact,
      about,
      education: eduEntries.length ? eduEntries : fallbackData.education,
      experience: expEntries.length ? expEntries : fallbackData.experience,
      projects: projEntries.length ? projEntries : fallbackData.projects,
      skills: Object.values(buckets).some((arr) => arr.length) ? buckets : fallbackData.skills,
      certificates: certBlock
        ? certBlock
            .split(/\n+/)
            .map((s) => s.replace(/^•\s*/, "").trim())
            .filter(Boolean)
        : fallbackData.certificates,
    };
  }

  async function extractPdfText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageTexts = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((it) => (typeof it.str === "string" ? it.str : ""));
      pageTexts.push(strings.join("\n"));
    }
    return pageTexts.join("\n\n");
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    extractPdfText(file)
      .then((text) => setParsed(parseResume(text)))
      .catch((err) => {
        console.error(err);
        setParsed(fallbackData);
      });
  }

  // Initial render with fallback until a PDF is uploaded
  useEffect(() => {
    if (!parsed) setParsed(fallbackData);
  }, []); // eslint-disable-line

  const skillsWithScores = useMemo(() => {
    if (!parsed) return [];
    const scoring = (i) => 85 - i * 5;
    const rows = [];
    Object.entries(parsed.skills).forEach(([cat, arr]) => {
      arr.forEach((skill, i) => rows.push({ cat, skill, score: Math.max(50, scoring(i)) }));
    });
    return rows;
  }, [parsed]);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "experience", label: "Experience" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "education", label: "Education" },
  ];

  if (!parsed) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Sticky, animated nav */}
      <header className="sticky top-0 z-50 backdrop-blur bg-slate-950/60 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="font-semibold tracking-wide">{parsed.name.split(" ")[0]} • Portfolio</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="text-sm text-slate-300 hover:text-white transition">
                {n.label}
              </a>
            ))}
            <a href={parsed.contact.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
          </nav>
          <button className="md:hidden" onClick={() => setNavOpen((v) => !v)}>
            {navOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {navOpen && (
          <div className="md:hidden px-4 pb-4 grid grid-cols-2 gap-3">
            {navItems.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={() => setNavOpen(false)}
                className="px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60"
              >
                {n.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* Hero with parallax shapes */}
      <section id="home" ref={heroRef} className="relative overflow-hidden">
        <motion.div style={{ y: yParallax, opacity: opacityParallax }} className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -right-24 h-72 w-72 bg-cyan-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 bg-fuchsia-500/10 rounded-full blur-3xl" />
        </motion.div>
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <p className="text-cyan-300 uppercase tracking-widest text-xs mb-4">Available for opportunities</p>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {parsed.name}
                <span className="block text-cyan-400 text-xl md:text-2xl mt-3">{parsed.role}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <Badge className="bg-white/10">Python</Badge>
                <Badge className="bg-white/10">Django</Badge>
                <Badge className="bg-white/10">FastAPi</Badge>
                <Badge className="bg-white/10">AWS</Badge>
                <Badge className="bg-white/10">LLMs</Badge>
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                <a href="#projects">
                  <Button>View Projects</Button>
                </a>
                <a href="/Sagar_Pagad_Bengaluru.pdf" download className="inline-flex items-center gap-2">
                  <Button className="group relative overflow-hidden bg-cyan-600 hover:bg-cyan-700 transition-all duration-300">
                    <span className="relative z-10 flex items-center gap-2">
                      <FileDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Download Resume
                    </span>
                    <span className="absolute inset-0 bg-cyan-400/30 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
                  </Button>
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {parsed.contact.phone}
                </span>
                <a className="inline-flex items-center gap-2 hover:text-white" href={`mailto:${parsed.contact.email}`}>
                  <Mail className="w-4 h-4" /> {parsed.contact.email}
                </a>
                <a className="inline-flex items-center gap-2 hover:text-white" href={parsed.contact.linkedin} target="_blank" rel="noreferrer">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <Card className="bg-slate-900/60 border-white/10 backdrop-blur-xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-xl text-cyan-300">About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-200 leading-relaxed">{parsed.about}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
        <div className="flex justify-center">
          <ChevronDown className="w-6 h-6 text-slate-500 animate-bounce mb-6" />
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="max-w-6xl mx-auto px-4 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-semibold mb-8"
        >
          Experience
        </motion.h2>
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/10" />
          <div className="grid md:grid-cols-2 gap-8">
            {parsed.experience.map((exp, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className={`md:col-span-1 ${idx % 2 ? "md:translate-y-8" : ""}`}
              >
                <Card className="bg-slate-900/60 border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all">
                  <CardHeader>
                    <CardTitle className="flex flex-wrap items-baseline gap-2">
                      <span className="text-lg text-cyan-400">{exp.title}</span>
                      <span className="text-slate-400">@ {exp.company}</span>
                    </CardTitle>
                    <div className="text-sm text-slate-400">{exp.period}</div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {exp.tags?.map((t, i) => (
                        <Badge key={i} className="bg-white/10">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {exp.bullets.slice(0, 3).map((b, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="mt-2 h-1.5 w-1.5 rounded-full bg-white/60" />
                        <p className="text-slate-300 leading-relaxed">{b}</p>
                      </div>
                    ))}

                    {/* Details dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="mt-3">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-white/10">
                        <DialogHeader>
                          <DialogTitle>
                            {exp.title} @ {exp.company}
                          </DialogTitle>
                        </DialogHeader>
                        <ul className="list-disc pl-6 space-y-2 text-slate-200">
                          {exp.bullets.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="bg-slate-950/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-semibold mb-8"
          >
            Skills
          </motion.h2>
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-white/10">
              <TabsTrigger value="grid">Overview</TabsTrigger>
              <TabsTrigger value="languages">Languages</TabsTrigger>
              <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
              <TabsTrigger value="databases">Databases</TabsTrigger>
              <TabsTrigger value="tooling">Tooling</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>
            <TabsContent value="grid" className="mt-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {skillsWithScores.map((s, i) => (
                  <motion.div
                    key={`${s.skill}-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.02 }}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{s.skill}</span>
                      <span className="text-xs text-slate-400">{s.cat}</span>
                    </div>
                    <Progress value={s.score} />
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            {["languages", "frameworks", "databases", "tooling", "data"].map((key) => (
              <TabsContent key={key} value={key} className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {(parsed.skills[key[0].toUpperCase() + key.slice(1)] || []).map((tag, i) => (
                    <Badge key={i} className="text-base bg-white/10">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="max-w-6xl mx-auto px-4 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-semibold mb-8"
        >
          Projects
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parsed.projects.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="rounded-2xl bg-slate-900/60 border border-white/10 p-5 group hover:shadow-xl transition"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <Badge className="bg-white/10">{p.stack?.[0] || "Project"}</Badge>
              </div>
              <p className="text-slate-300 leading-relaxed">{p.summary}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {p.stack?.slice(0, 6).map((t, idx) => (
                  <Badge key={idx} className="bg-white/10">
                    {t}
                  </Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section id="education" className="bg-slate-950/40 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-semibold mb-8"
          >
            Education
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            {parsed.education.map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl bg-slate-900/60 border border-white/10 p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{e.degree}</h3>
                  <Badge className="bg-white/10">{e.period}</Badge>
                </div>
                <p className="text-slate-300 mt-2">{e.institute}</p>
                {e.score && <p className="text-slate-400 text-sm mt-1">{e.score}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-10 text-center text-slate-400">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <a className="inline-flex items-center gap-2 hover:text-white" href={`mailto:${parsed.contact.email}`}>
              <Mail className="w-4 h-4" /> {parsed.contact.email}
            </a>
            <span className="inline-flex items-center gap-2">
              <Phone className="w-4 h-4" /> {parsed.contact.phone}
            </span>
            <a className="inline-flex items-center gap-2 hover:text-white" href={parsed.contact.linkedin} target="_blank" rel="noreferrer">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} {parsed.name}</p>
        </div>
      </footer>
    </div>
  );
}