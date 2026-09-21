// ===== Academic data: edit only this block to update results =====
const ACADEMICS = {
  totalSemesters: 12,
  semestersPerYear: 3,
  currentSemester: 5,
  sgpa: [4.0, 4.0, 3.94, 4.0], // add each new semester's SGPA here
};

// Simple average of SGPAs; switch to a credit-weighted average if needed.
const cgpa = ACADEMICS.sgpa.reduce((sum, v) => sum + v, 0) / ACADEMICS.sgpa.length;
const completed = ACADEMICS.sgpa.length;

// ===== Academics UI =====
const year = Math.ceil(ACADEMICS.currentSemester / ACADEMICS.semestersPerYear);
const semInYear = ((ACADEMICS.currentSemester - 1) % ACADEMICS.semestersPerYear) + 1;
const progressPct = Math.round((completed / ACADEMICS.totalSemesters) * 100);

document.getElementById("cgpaMeta").textContent =
  `Across ${completed} completed semester${completed === 1 ? "" : "s"}`;
document.getElementById("progressText").textContent =
  `${completed} / ${ACADEMICS.totalSemesters} semesters`;
document.getElementById("currentSemText").textContent =
  `Currently in Semester ${ACADEMICS.currentSemester} (Year ${year}, Semester ${semInYear}) · ${progressPct}% complete`;

const chart = document.getElementById("sgpaChart");
for (let i = 0; i < ACADEMICS.totalSemesters; i++) {
  const value = ACADEMICS.sgpa[i];
  const bar = document.createElement("div");
  bar.className = "bar" + (value === undefined ? " bar--pending" : "");
  bar.innerHTML = `
    <span class="bar__value">${value !== undefined ? value.toFixed(2) : ""}</span>
    <div class="bar__col" data-height="${value !== undefined ? (value / 4) * 100 : 6}"></div>
    <span class="bar__label">S${i + 1}</span>`;
  bar.title = value !== undefined ? `Semester ${i + 1}: ${value.toFixed(2)}` : `Semester ${i + 1}: upcoming`;
  chart.appendChild(bar);
}

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
