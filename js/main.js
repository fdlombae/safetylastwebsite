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
// Shows a thumbnail first and only loads the YouTube player when clicked,
// which keeps the page fast and avoids YouTube cookies until then.
(function () {
  function videoId(value) {
    const match = value.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return match ? match[1] : value.trim();
  }

  document.querySelectorAll('.yt[data-youtube]').forEach((el) => {
    const id = videoId(el.dataset.youtube);
    const caption = el.closest('figure')?.querySelector('figcaption');
    const title = caption ? caption.textContent.trim() : 'YouTube-video';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'yt__play';
    button.setAttribute('aria-label', 'Video afspelen: ' + title);

    const thumb = document.createElement('img');
    thumb.alt = '';
    thumb.loading = 'lazy';
    thumb.src = 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg';
    // YouTube serves a 120px grey placeholder when there is no HD thumbnail.
    thumb.addEventListener('load', () => {
      if (thumb.naturalWidth <= 120) thumb.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
    });
    button.appendChild(thumb);

    button.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      iframe.title = title;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      el.replaceChildren(iframe);
    });

    el.appendChild(button);
  });
})();
