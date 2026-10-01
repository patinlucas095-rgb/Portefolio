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


// pages : l'accueil (présentation, parcours, contact) et les pages à part
// (expériences, projets, veille, projet futur). On change de page avec l'ancre de l'URL,
// donc le bouton « retour » du navigateur marche et chaque page a son lien.

const views = document.querySelectorAll('[data-view]');
const navLinks = document.querySelectorAll('[data-nav]');
const baseTitle = 'Lucas Patin — Étudiant en cybersécurité';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentView = null;

function showView(firstLoad) {
  const id = decodeURIComponent(location.hash.slice(1)) || 'accueil';
  const target = document.getElementById(id);
  const view = (target && target.closest('[data-view]')) || document.querySelector('[data-view="accueil"]');
  const name = view.dataset.view;
  const changed = name !== currentView;

  views.forEach(v => { v.hidden = v !== view; });
  navLinks.forEach(link => {
    if (link.dataset.nav === name) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  if (changed && !firstLoad && !reduceMotion) {
    view.classList.remove('view-enter');
    void view.offsetWidth; // relance l'animation
    view.classList.add('view-enter');
  }

  const title = view.querySelector('h2, h1');
  document.title = name === 'accueil' ? baseTitle : title.textContent + ' — Lucas Patin';

  // haut de page si on arrive sur une page, sinon on descend jusqu'à la section demandée
  if (!target || target === view || id === 'accueil') {
    if (changed || id === 'accueil') window.scrollTo({ top: 0, behavior: changed || reduceMotion ? 'auto' : 'smooth' });
  } else {
    target.scrollIntoView({ behavior: changed || reduceMotion ? 'auto' : 'smooth' });
  }

  // pour les lecteurs d'écran : on annonce le titre de la nouvelle page
  if (changed && !firstLoad && title) {
    title.setAttribute('tabindex', '-1');
    title.focus({ preventScroll: true });
  }

  currentView = name;
}

window.addEventListener('hashchange', () => showView(false));
showView(true);


// logos : si une image ne charge pas, on affiche les initiales à la place
// (jamais d'image cassée)

function logoFallback(img) {
  const badge = document.createElement('span');
  badge.className = 'logo-badge';
  badge.textContent = img.dataset.initials || '?';
  badge.setAttribute('aria-hidden', 'true');
  img.closest('.logo-frame').replaceWith(badge);
}

document.querySelectorAll('.logo-frame img').forEach(img => {
  if (img.complete && img.naturalWidth === 0) logoFallback(img);
  else img.addEventListener('error', () => logoFallback(img));
});

// photo : si elle ne charge pas, on retire le cadre
document.querySelectorAll('img[data-hide-on-error]').forEach(img => {
  const hide = () => img.closest('figure').classList.add('no-photo');
  if (img.complete && img.naturalWidth === 0) hide();
  else img.addEventListener('error', hide);
});


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
