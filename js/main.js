// ---------- Ensemble carousel ----------
(function () {
  const track = document.querySelector('.carousel__track');
  if (!track) return;

  const buttons = document.querySelectorAll('.carousel__btn');
  const progress = document.querySelector('.carousel__progress');
  const members = track.querySelectorAll('.member');

  function step() {
    const card = members[0];
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const perView = Math.max(1, Math.floor(track.clientWidth / (card.offsetWidth + gap)) - 1);
    return perView * (card.offsetWidth + gap);
  }

  function update() {
    const max = track.scrollWidth - track.clientWidth;
    const ratio = max > 0 ? track.scrollLeft / max : 1;
    progress.style.setProperty('--progress', Math.min(1, Math.max(0.08, ratio)));
    buttons[0].disabled = track.scrollLeft <= 2;
    buttons[1].disabled = track.scrollLeft >= max - 2;
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      track.scrollBy({ left: step() * Number(btn.dataset.dir), behavior: 'smooth' });
    });
  });

  // Touch screens have no hover: tap a portrait to show or hide its bio.
  const noHover = window.matchMedia('(hover: none)');
  members.forEach((member) => {
    member.addEventListener('click', () => {
      if (!noHover.matches) return;
      const open = member.classList.contains('is-open');
      members.forEach((m) => m.classList.remove('is-open'));
      if (!open) member.classList.add('is-open');
    });
  });

  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// ---------- YouTube embeds ----------
// Each video is a plain link to YouTube (so it works without JavaScript and
// search engines can follow it). Here it gets a thumbnail, and the player is
// only loaded when clicked, which keeps the page fast and avoids YouTube
// cookies until then.
(function () {
  const playLabels = {
    nl: 'Video afspelen: ',
    en: 'Play video: ',
    fr: 'Lire la vidéo : ',
    de: 'Video abspielen: ',
    es: 'Reproducir vídeo: ',
  };
  const playLabel = playLabels[document.documentElement.lang] || playLabels.en;

  function videoId(url) {
    const match = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return match ? match[1] : null;
  }

  document.querySelectorAll('a.yt').forEach((link) => {
    const id = videoId(link.href);
    if (!id) return;
    const caption = link.closest('figure')?.querySelector('figcaption');
    const title = caption ? caption.textContent.trim() : 'YouTube';
    link.setAttribute('aria-label', playLabel + title);

    const thumb = document.createElement('img');
    thumb.alt = '';
    thumb.loading = 'lazy';
    thumb.src = 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg';
    // YouTube serves a 120px grey placeholder when there is no HD thumbnail.
    thumb.addEventListener('load', () => {
      if (thumb.naturalWidth <= 120) thumb.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
    });
    link.appendChild(thumb);

    link.addEventListener('click', (event) => {
      event.preventDefault();
      const player = document.createElement('div');
      player.className = 'yt';
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      iframe.title = title;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      player.appendChild(iframe);
      link.replaceWith(player);
    });
  });
})();
