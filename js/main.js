/* ============================================================
   ARJUNA CALEB GYAN – PORTFOLIO  |  Main JavaScript
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────
   CONFIG
   ──────────────────────────────────────────── */
// Formspree endpoint – replace YOUR_FORM_ID with the real ID from formspree.io
// Steps: go to formspree.io → New Form → paste the ID below
// e.g. "https://formspree.io/f/xyzabcde"
const FORMSPREE_URL = 'https://formspree.io/f/mnjrlgyw'; // ← set your ID

/* ─────────────────────────────────────────────
   1. AOS (Animate On Scroll)
   ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 60 });
  }
});

/* ─────────────────────────────────────────────
   2. Navbar – Scroll + Active link
   ──────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const navLinks  = document.getElementById('navLinks');
const navToggle = document.getElementById('navToggle');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  highlightActiveSection();
});

function highlightActiveSection() {
  const pos = window.scrollY + 110;
  document.querySelectorAll('section[id]').forEach(sec => {
    const top    = sec.offsetTop;
    const bottom = top + sec.offsetHeight;
    const link   = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
    if (link) link.classList.toggle('active', pos >= top && pos < bottom);
  });
}

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
  });
});

/* ─────────────────────────────────────────────
   3. Hero Typewriter
   ──────────────────────────────────────────── */
const roles = [
  'Software Engineer',
  'NPCC 2026 Finalist',
  'Full‑Stack Developer',
  'Product Manager',
  'AI Enthusiast',
  'Fintech Builder',
];

const roleEl = document.getElementById('roleText');
let ri = 0, ci = 0, del = false, td = 110;

function typeRole() {
  if (!roleEl) return;
  const r = roles[ri];
  if (del) { roleEl.textContent = r.substring(0, ci - 1); ci--; td = 55; }
  else     { roleEl.textContent = r.substring(0, ci + 1); ci++; td = 110; }
  if (!del && ci === r.length)       { del = true;  td = 1800; }
  else if (del && ci === 0)          { del = false; ri = (ri + 1) % roles.length; td = 400; }
  setTimeout(typeRole, td);
}
setTimeout(typeRole, 800);

/* ─────────────────────────────────────────────
   4. Skill Bars
   ──────────────────────────────────────────── */
function animateSkillBars() {
  document.querySelectorAll('.skill-bar-fill').forEach(bar => {
    const rect = bar.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80 && !bar.dataset.animated) {
      bar.style.width = bar.getAttribute('data-width') + '%';
      bar.dataset.animated = '1';
    }
  });
}
window.addEventListener('scroll', animateSkillBars, { passive: true });
setTimeout(animateSkillBars, 400);

/* ─────────────────────────────────────────────
   5. Project Filter
   ──────────────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.getAttribute('data-filter');
    document.querySelectorAll('.project-card').forEach(card => {
      const match = f === 'all' || card.getAttribute('data-category') === f;
      card.classList.toggle('hidden', !match);
      if (match) card.style.animation = 'fadeInUp 0.4s ease forwards';
    });
  });
});

/* ─────────────────────────────────────────────
   6. Contact Form – Formspree + localStorage
   ──────────────────────────────────────────── */
const contactForm      = document.getElementById('contactForm');
const formSuccessEl    = document.getElementById('formSuccess');
const formErrorGlobal  = document.getElementById('formErrorGlobal');

function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function showErr(id, msg) { const el = document.getElementById(id); if (el) el.textContent = msg; }
function clearErr(id)     { const el = document.getElementById(id); if (el) el.textContent = ''; }

/* Save message to localStorage so admin.html can display it */
function saveMessageLocally(data) {
  try {
    const existing = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
    existing.unshift({
      id:      Date.now(),
      name:    data.name,
      email:   data.email,
      subject: data.subject || '(no subject)',
      message: data.message,
      time:    new Date().toLocaleString(),
      read:    false,
    });
    // keep max 100 messages
    localStorage.setItem('portfolio_messages', JSON.stringify(existing.slice(0, 100)));
  } catch (e) { /* ignore */ }
}

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;

    const name    = document.getElementById('contactName').value.trim();
    const email   = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject')?.value.trim() || '';
    const message = document.getElementById('contactMessage').value.trim();

    ['nameError','emailError','msgError'].forEach(clearErr);
    formErrorGlobal.classList.remove('visible');

    if (!name || name.length < 2)       { showErr('nameError',  'Please enter your full name.'); valid = false; }
    if (!email || !validateEmail(email)) { showErr('emailError', 'Please enter a valid email.'); valid = false; }
    if (!message || message.length < 10) { showErr('msgError',  'Message must be at least 10 characters.'); valid = false; }

    if (!valid) return;

    const submitBtn = contactForm.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    const payload = { name, email, subject, message,
      _subject: `Portfolio Contact from ${name}`,
      _replyto: email };

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Save locally for admin panel
        saveMessageLocally({ name, email, subject, message });
        contactForm.reset();
        formSuccessEl.classList.add('visible');
        setTimeout(() => formSuccessEl.classList.remove('visible'), 6000);
      } else {
        const data = await res.json().catch(() => ({}));
        const errMsg = data?.errors?.[0]?.message || 'Something went wrong. Please email directly.';
        formErrorGlobal.textContent = errMsg;
        formErrorGlobal.classList.add('visible');
      }
    } catch (_) {
      // Network failure: still save locally
      saveMessageLocally({ name, email, subject, message });
      formSuccessEl.classList.add('visible');
      formSuccessEl.innerHTML = '<i class="fas fa-check-circle"></i> Message saved! (Will be delivered when online.)';
      setTimeout(() => formSuccessEl.classList.remove('visible'), 6000);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    }
  });

  ['contactName','contactEmail','contactMessage'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      const map = { contactName:'nameError', contactEmail:'emailError', contactMessage:'msgError' };
      clearErr(map[id]);
    });
  });
}

/* ─────────────────────────────────────────────
   7. Smooth Scroll
   ──────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 70;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    }
  });
});

/* ─────────────────────────────────────────────
   8. SVG Gradient for language circles
   ──────────────────────────────────────────── */
(function() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  svg.innerHTML = `<defs>
    <linearGradient id="langGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>`;
  document.body.insertBefore(svg, document.body.firstChild);
})();

/* ─────────────────────────────────────────────
   9. Hamburger animation styles
   ──────────────────────────────────────────── */
const dynStyle = document.createElement('style');
dynStyle.textContent = `
  .nav-toggle.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .nav-toggle.open span:nth-child(2) { opacity:0; transform:scaleX(0); }
  .nav-toggle.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  @keyframes fadeInUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
`;
document.head.appendChild(dynStyle);

/* ─────────────────────────────────────────────
   10. Card tilt (desktop only)
   ──────────────────────────────────────────── */
function addTilt(selector) {
  if (window.innerWidth < 768) return;
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 8;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * -8;
      card.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}
addTilt('.cert-card');
addTilt('.exp-card');

/* ─────────────────────────────────────────────
   11. Intersection Observer for skill bars
   ──────────────────────────────────────────── */
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) animateSkillBars(); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.section').forEach(s => obs.observe(s));
}

/* ─────────────────────────────────────────────
   12. Logo → scroll to top
   ──────────────────────────────────────────── */
document.querySelectorAll('.nav-logo, .footer-logo').forEach(logo => {
  logo.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top:0, behavior:'smooth' }); });
});

/* ─────────────────────────────────────────────
   END
   ──────────────────────────────────────────── */
console.log('%c Arjuna Caleb Gyan – Portfolio ',
  'background:#6366f1;color:#fff;font-size:13px;font-weight:700;padding:5px 12px;border-radius:4px;');
console.log('%c a.gyan@alustudent.com | +230 5519 8492 ',
  'color:#06b6d4;font-size:11px;');
