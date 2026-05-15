// ==========================
// 0. HERO — Fond particules animées
// ==========================

function initParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'hero-canvas';
  hero.insertBefore(canvas, hero.firstChild);

  const ctx = canvas.getContext('2d');

  const COLOR_1 = '108, 99, 255';  // violet
  const COLOR_2 = '0, 212, 255';   // cyan

  let particles = [];
  const COUNT = 80;
  const MAX_DIST = 140;

  function resize() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  function createParticle() {
    return {
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r:  Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? COLOR_1 : COLOR_2,
    };
  }

  function initParticlesArray() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, 0.7)`;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
          const opacity = (1 - dist / MAX_DIST) * 0.35;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${a.color}, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  initParticlesArray();
  draw();

  window.addEventListener('resize', () => {
    resize();
    initParticlesArray();
  });
}


// ==========================
// 1. HERO — Animation d'apparition du texte
// ==========================

function animateHero() {
  const eyebrow = document.querySelector('.hero-eyebrow');
  const title   = document.querySelector('.hero h1');
  const sub     = document.querySelector('.hero-sub');
  const btn     = document.querySelector('.hero .btn');

  if (!title) return;

  const fullHTML = title.innerHTML;
  title.innerHTML = '';
  title.style.opacity = '1';

  [eyebrow, sub, btn].forEach(el => {
    if (el) {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(18px)';
      el.style.transition = 'none';
    }
  });

  setTimeout(() => fadeIn(eyebrow), 200);

  setTimeout(() => {
    typewriterHTML(title, fullHTML, 38, () => {
      setTimeout(() => fadeIn(sub), 100);
      setTimeout(() => fadeIn(btn), 350);
    });
  }, 550);
}

function fadeIn(el) {
  if (!el) return;
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  el.style.opacity    = '1';
  el.style.transform  = 'translateY(0)';
}

function typewriterHTML(el, html, speed, onDone) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const nodes = Array.from(temp.childNodes);

  let nodeIndex = 0;
  let charIndex  = 0;

  function next() {
    if (nodeIndex >= nodes.length) {
      if (onDone) onDone();
      return;
    }

    const node = nodes[nodeIndex];

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (charIndex === 0) {
        node._target = document.createTextNode('');
        el.appendChild(node._target);
      }
      if (charIndex < text.length) {
        node._target.textContent += text[charIndex];
        charIndex++;
        setTimeout(next, speed);
      } else {
        charIndex = 0;
        nodeIndex++;
        setTimeout(next, speed);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const span = node.cloneNode(false);
      span.textContent = '';
      el.appendChild(span);
      const text = node.textContent;
      let i = 0;
      function typeSpan() {
        if (i < text.length) {
          span.textContent += text[i];
          i++;
          setTimeout(typeSpan, speed);
        } else {
          nodeIndex++;
          charIndex = 0;
          setTimeout(next, speed);
        }
      }
      typeSpan();
    }
  }

  next();
}

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  animateHero();
});


// ==========================
// 2. NAVBAR — devient opaque au scroll
// ==========================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});


// ==========================
// 3. MODALES — ouverture et fermeture
// ==========================

const overlay = document.getElementById('overlay');

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    const modalId = card.getAttribute('data-modal');
    const modal = document.getElementById('modal-' + modalId);
    if (modal) {
      overlay.classList.add('active');
      modal.classList.add('active');
    }
  });
});

function closeAllModals() {
  overlay.classList.remove('active');
  document.querySelectorAll('.modal.active').forEach(m => {
    m.classList.remove('active');
  });
}

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', closeAllModals);
});

overlay.addEventListener('click', closeAllModals);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAllModals();
});


// ==========================
// 4. FORMULAIRE — Message de confirmation
// ==========================

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = contactForm.querySelector('input[type="text"]').value;
    showNotification(`Message envoyé ! Merci ${name} 🚀`);
    contactForm.reset();
  });
}

function showNotification(message) {
  const notification = document.createElement('div');

  notification.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: linear-gradient(135deg, #6c63ff, #00d4ff);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 0.95rem;
    box-shadow: 0 10px 30px rgba(108, 99, 255, 0.4);
    z-index: 9999;
    animation: slideIn 0.4s ease;
  `;

  notification.textContent = message;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100px); opacity: 0; }
      to   { transform: translateX(0);     opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity    = '0';
    notification.style.transition = 'opacity 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}