// navbar : fond plein dès qu'on a un peu scrollé

const navbar = document.getElementById('navbar');

function updateNavbar() {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
}

window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();


// menu mobile

const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navToggleLabel = navToggle.querySelector('.sr-only');

function setMenu(open) {
  navMenu.classList.toggle('open', open);
  navbar.classList.toggle('menu-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggleLabel.textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
}

navToggle.addEventListener('click', () => {
  setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
});

navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navMenu.classList.contains('open')) {
    setMenu(false);
    navToggle.focus();
  }
});


// logos et photo : l'image remplace le badge seulement si le fichier existe
// (sinon on garde le badge avec les initiales, jamais d'image cassée)

document.querySelectorAll('[data-logo]').forEach(badge => {
  const img = new Image();
  img.onload = () => {
    img.className = 'logo-img';
    img.alt = badge.dataset.alt || '';
    img.width = 48;
    img.height = 48;
    badge.replaceWith(img);
  };
  img.src = badge.dataset.logo;
});

const photo = document.querySelector('[data-photo]');

if (photo) {
  const img = new Image();
  img.onload = () => {
    img.alt = photo.dataset.alt || '';
    photo.appendChild(img);
    photo.hidden = false;
  };
  img.src = photo.dataset.photo;
}


// modales des projets (<dialog> gère déjà le focus et la touche Échap)

let lastTrigger = null;

document.querySelectorAll('[data-modal]').forEach(card => {
  card.addEventListener('click', () => {
    const modal = document.getElementById('modal-' + card.dataset.modal);
    if (!modal) return;
    lastTrigger = card;
    modal.showModal();
  });
});

document.querySelectorAll('dialog.modal').forEach(modal => {
  modal.querySelector('.modal-close').addEventListener('click', () => modal.close());

  // clic à côté de la fenêtre = fermer
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });

  modal.addEventListener('close', () => {
    if (lastTrigger) lastTrigger.focus();
  });
});


// copier l'adresse mail

const copyBtn = document.getElementById('copy-email');
const copyLabel = copyBtn.querySelector('.copy-label');
const copyStatus = document.getElementById('copy-status');
let copyTimer;

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.email);
    copyLabel.textContent = 'Copié !';
    copyStatus.textContent = 'Adresse e-mail copiée.';
  } catch {
    copyLabel.textContent = 'Raté, copiez à la main';
    copyStatus.textContent = 'La copie automatique ne marche pas ici.';
  }
  copyBtn.classList.add('copied');

  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    copyLabel.textContent = 'Copier';
    copyStatus.textContent = '';
    copyBtn.classList.remove('copied');
  }, 2000);
});


// apparitions douces au scroll

const revealItems = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach(el => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealItems.forEach(el => observer.observe(el));
}
