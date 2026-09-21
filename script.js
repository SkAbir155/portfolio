// ===== Academic data: edit only this block to update results =====
// To add a semester, append an object with its SGPA and courses. Leave grade as "" if unknown.
const ACADEMICS = {
  totalSemesters: 12,
  semestersPerYear: 3,
  currentSemester: 5,
  semesters: [
    {
      sgpa: 4.0,
      courses: [
        { name: "Communicative English", credits: 1, grade: "A+" },
        { name: "Principles of Accounting", credits: 3, grade: "A+" },
        { name: "ICT in Business", credits: 3, grade: "A+" },
        { name: "ICT in Business Lab", credits: 3, grade: "A+" },
      ],
    },
    {
      sgpa: 4.0,
      courses: [
        { name: "Introduction to Business", credits: 3, grade: "A+" },
        { name: "Programming for Business Analytics", credits: 2, grade: "A+" },
        { name: "Programming for Business Analytics Lab", credits: 1, grade: "A+" },
        { name: "Business Mathematics", credits: 3, grade: "A+" },
        { name: "History of the Emergence of Bangladesh", credits: 3, grade: "A+" },
      ],
    },
    {
      sgpa: 3.94,
      courses: [
        { name: "Principles of Finance", credits: 3, grade: "A+" },
        { name: "Principles of Management", credits: 3, grade: "A" },
        { name: "Principles of Marketing", credits: 3, grade: "A+" },
        { name: "Microeconomics", credits: 3, grade: "A+" },
      ],
    },
    {
      sgpa: 4.0,
      courses: [
        { name: "Management Information System", credits: 2, grade: "A+" },
        { name: "Management Information System Lab", credits: 1, grade: "A+" },
        { name: "The Art of Living", credits: 3, grade: "A+" },
        { name: "Differential and Integral Calculus", credits: 3, grade: "A+" },
        { name: "Business Communication", credits: 3, grade: "A+" },
      ],
    },
  ],
};

const GRADE_POINTS = { "A+": 4.0, A: 3.75, "A-": 3.5, "B+": 3.25, B: 3.0, "B-": 2.75, "C+": 2.5, C: 2.25, D: 2.0, F: 0 };

const semesters = ACADEMICS.semesters.map((s) => ({
  ...s,
  credits: s.courses.reduce((sum, c) => sum + c.credits, 0),
}));
const completed = semesters.length;
const totalCredits = semesters.reduce((sum, s) => sum + s.credits, 0);
// CGPA is credit-weighted: sum(SGPA x semester credits) / total credits
const cgpa = semesters.reduce((sum, s) => sum + s.sgpa * s.credits, 0) / totalCredits;

// ===== Academics UI =====
const yearOf = (sem) => Math.ceil(sem / ACADEMICS.semestersPerYear);
const semInYearOf = (sem) => ((sem - 1) % ACADEMICS.semestersPerYear) + 1;
const progressPct = Math.round((completed / ACADEMICS.totalSemesters) * 100);

document.getElementById("cgpaMeta").textContent =
  `Across ${completed} completed semester${completed === 1 ? "" : "s"} · ${totalCredits} credits`;
document.getElementById("progressText").textContent = `${completed} / ${ACADEMICS.totalSemesters} semesters`;
document.getElementById("currentSemText").textContent =
  `Currently in Semester ${ACADEMICS.currentSemester} (Year ${yearOf(ACADEMICS.currentSemester)}, ` +
  `Semester ${semInYearOf(ACADEMICS.currentSemester)}) · ${progressPct}% complete`;

const chart = document.getElementById("sgpaChart");
const coursePanel = document.getElementById("coursePanel");

for (let i = 0; i < ACADEMICS.totalSemesters; i++) {
  const sem = semesters[i];
  const bar = document.createElement("div");
  bar.className = "bar" + (sem ? "" : " bar--pending");
  bar.innerHTML = `
    <div class="bar__track">
      <div class="bar__col" data-height="${sem ? (sem.sgpa / 4) * 100 : 6}">
        <span class="bar__value">${sem ? sem.sgpa.toFixed(2) : ""}</span>
      </div>
    </div>
    <span class="bar__label">S${i + 1}</span>
    ${
      sem
        ? `<button class="bar__btn" type="button" data-sem="${i}" aria-expanded="false" aria-controls="coursePanel"
             aria-label="View course details for Semester ${i + 1}" title="View course details">
             <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z"/></svg>
             <span>Details</span>
           </button>`
        : `<span class="bar__btn-spacer"></span>`
    }`;
  bar.title = sem ? `Semester ${i + 1}: ${sem.sgpa.toFixed(2)}` : `Semester ${i + 1}: upcoming`;
  chart.appendChild(bar);
}

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function formatGrade(grade) {
  if (!grade) return `<span class="grade grade--na">&mdash;</span>`;
  const pts = GRADE_POINTS[grade];
  return `<span class="grade${grade === "A+" ? " grade--top" : ""}">${escapeHtml(grade)}</span>` +
    (pts !== undefined ? `<small>${pts.toFixed(2)}</small>` : "");
}

let openSem = null;

function showSemester(index) {
  const sem = semesters[index];
  const n = index + 1;
  coursePanel.innerHTML = `
    <div class="course-panel__head">
      <div>
        <h3>Semester ${n} <span>Year ${yearOf(n)}, Semester ${semInYearOf(n)}</span></h3>
        <p class="course-panel__stats">
          <span><strong>${sem.credits}</strong> credits</span>
          <span><strong>${sem.courses.length}</strong> courses</span>
          <span>SGPA <strong>${sem.sgpa.toFixed(2)}</strong></span>
        </p>
      </div>
      <button class="course-panel__close" type="button" aria-label="Close course details">&times;</button>
    </div>
    <table class="course-table">
      <thead><tr><th scope="col">Course</th><th scope="col">Credits</th><th scope="col">Grade</th></tr></thead>
      <tbody>
        ${sem.courses
          .map((c) => `<tr><td>${escapeHtml(c.name)}</td><td>${c.credits}</td><td>${formatGrade(c.grade)}</td></tr>`)
          .join("")}
      </tbody>
    </table>`;
  coursePanel.hidden = false;
  requestAnimationFrame(() => coursePanel.classList.add("is-open"));
  openSem = index;

  chart.querySelectorAll(".bar__btn").forEach((b) => {
    const active = Number(b.dataset.sem) === index;
    b.setAttribute("aria-expanded", active);
    b.closest(".bar").classList.toggle("is-selected", active);
  });

  coursePanel.querySelector(".course-panel__close").addEventListener("click", hideSemester);
  coursePanel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
}

function hideSemester() {
  const btn = chart.querySelector(`.bar__btn[data-sem="${openSem}"]`);
  coursePanel.classList.remove("is-open");
  coursePanel.hidden = true;
  chart.querySelectorAll(".bar").forEach((b) => b.classList.remove("is-selected"));
  chart.querySelectorAll(".bar__btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
  openSem = null;
  btn?.focus();
}

chart.addEventListener("click", (e) => {
  const btn = e.target.closest(".bar__btn");
  if (!btn) return;
  const index = Number(btn.dataset.sem);
  index === openSem ? hideSemester() : showSemester(index);
});

function animateCounter(el, target, duration = 1600) {
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * eased).toFixed(3);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ===== Scroll-triggered animations =====
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("is-visible");

      if (el.classList.contains("cgpa-card")) {
        const valueEl = document.getElementById("cgpaValue");
        reduceMotion ? (valueEl.textContent = cgpa.toFixed(3)) : animateCounter(valueEl, cgpa);
      }
      if (el.classList.contains("progress-card")) {
        document.getElementById("progressFill").style.width = progressPct + "%";
      }
      if (el.id === "sgpaChart") {
        el.querySelectorAll(".bar__col").forEach((col, i) => {
          setTimeout(() => (col.style.height = col.dataset.height + "%"), reduceMotion ? 0 : i * 70);
        });
      }
      observer.unobserve(el);
    });
  },
  { threshold: 0.2 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ===== Achievement card tilt on hover =====
if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".achievement").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-6px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    });
    card.addEventListener("mouseleave", () => (card.style.transform = ""));
  });
}

// ===== Photo gallery lightbox =====
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lightboxImg");
const lbTitle = document.getElementById("lightboxTitle");
const lbCount = document.getElementById("lightboxCount");
const lbThumbs = document.getElementById("lightboxThumbs");
const lbPrev = document.getElementById("lightboxPrev");
const lbNext = document.getElementById("lightboxNext");
let gallery = [];
let galleryIndex = 0;
let galleryTitle = "";
let lastFocus = null;

function showPhoto(i) {
  galleryIndex = (i + gallery.length) % gallery.length;
  lbImg.classList.remove("is-loaded");
  lbImg.onload = () => lbImg.classList.add("is-loaded");
  lbImg.src = gallery[galleryIndex];
  lbImg.alt = `${galleryTitle}, photo ${galleryIndex + 1} of ${gallery.length}`;
  lbCount.textContent = `${galleryIndex + 1} / ${gallery.length}`;
  lbThumbs.querySelectorAll("button").forEach((t, j) => t.setAttribute("aria-current", j === galleryIndex));
  // Preload the next photo so arrowing through feels instant
  if (gallery.length > 1) new Image().src = gallery[(galleryIndex + 1) % gallery.length];
}

function openGallery(card) {
  gallery = card.dataset.gallery.split(",").map((s) => s.trim()).filter(Boolean);
  if (!gallery.length) return;
  galleryTitle = card.dataset.title;
  lastFocus = document.activeElement;
  lbTitle.textContent = galleryTitle;
  lbThumbs.innerHTML = gallery
    .map((src, j) => `<button type="button" aria-label="Show photo ${j + 1}"><img src="${src}" alt="" loading="lazy" /></button>`)
    .join("");
  lbThumbs.querySelectorAll("button").forEach((t, j) => t.addEventListener("click", () => showPhoto(j)));
  const single = gallery.length < 2;
  lbPrev.hidden = single;
  lbNext.hidden = single;
  lbThumbs.hidden = single;

  lightbox.hidden = false;
  document.body.classList.add("no-scroll");
  requestAnimationFrame(() => lightbox.classList.add("is-open"));
  showPhoto(0);
  lightbox.querySelector(".lightbox__close").focus();
}

function closeGallery() {
  lightbox.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
  setTimeout(() => (lightbox.hidden = true), reduceMotion ? 0 : 250);
  lastFocus?.focus();
}

document.querySelectorAll(".achievement[data-gallery]").forEach((card) => {
  card.addEventListener("click", () => openGallery(card));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openGallery(card);
    }
  });
});

lightbox.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeGallery));
lbPrev.addEventListener("click", () => showPhoto(galleryIndex - 1));
lbNext.addEventListener("click", () => showPhoto(galleryIndex + 1));

document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) {
    if (e.key === "Escape" && openSem !== null) hideSemester();
    return;
  }
  if (e.key === "Escape") closeGallery();
  else if (e.key === "ArrowLeft" && gallery.length > 1) showPhoto(galleryIndex - 1);
  else if (e.key === "ArrowRight" && gallery.length > 1) showPhoto(galleryIndex + 1);
  else if (e.key === "Tab") {
    // Keep keyboard focus inside the open dialog
    const focusable = [...lightbox.querySelectorAll("button:not([hidden])")].filter((b) => b.offsetParent !== null);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

let touchX = null;
lbImg.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
lbImg.addEventListener("touchend", (e) => {
  if (touchX === null || gallery.length < 2) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) showPhoto(galleryIndex + (dx < 0 ? 1 : -1));
  touchX = null;
});

// ===== Nav: scrolled state, mobile menu, active link =====
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const links = document.querySelectorAll(".nav__links a");

window.addEventListener("scroll", () => nav.classList.toggle("is-scrolled", window.scrollY > 20), { passive: true });

toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
});
links.forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("main section[id]").forEach((s) => sectionObserver.observe(s));

// Inactive social links shouldn't jump to top of page
document.querySelectorAll(".social.is-inactive").forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));

document.getElementById("year").textContent = new Date().getFullYear();
