/* ============================================================
   Портфолио-презентация · логика навигации
   Клавиатура, точки, стрелки, свайпы, прогресс, счётчик
   ============================================================ */
(function () {
  'use strict';

  const slides = Array.from(document.querySelectorAll('.slide'));
  const dotsBox = document.getElementById('dots');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const progress = document.getElementById('progress');
  const curEl = document.getElementById('cur');
  const totalEl = document.getElementById('total');
  const hint = document.getElementById('hint');

  let current = 0;
  const total = slides.length;

  totalEl.textContent = String(total).padStart(2, '0');

  /* ---- точки ---- */
  slides.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'dot-btn';
    b.type = 'button';
    b.setAttribute('aria-label', 'Слайд ' + (i + 1) + (s.dataset.title ? ' — ' + s.dataset.title : ''));
    b.title = s.dataset.title || ('Слайд ' + (i + 1));
    b.addEventListener('click', () => go(i));
    dotsBox.appendChild(b);
  });
  const dots = Array.from(dotsBox.children);

  function go(index) {
    if (index < 0 || index >= total || index === current) {
      if (index === current) return;
    }
    index = Math.max(0, Math.min(total - 1, index));

    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = index;
    const slide = slides[current];
    slide.classList.add('active');
    dots[current].classList.add('active');
    slide.scrollTop = 0;

    // перезапуск анимаций появления
    slide.querySelectorAll('.reveal').forEach(el => {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
    curEl.textContent = String(current + 1).padStart(2, '0');
    progress.style.width = ((current) / (total - 1) * 100) + '%';

    if (current > 0 && hint) hint.classList.add('hide');
  }

  prevBtn.addEventListener('click', () => go(current - 1));
  nextBtn.addEventListener('click', () => go(current + 1));

  /* ---- клавиатура ---- */
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault(); go(current + 1); break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault(); go(current - 1); break;
      case 'Home': e.preventDefault(); go(0); break;
      case 'End': e.preventDefault(); go(total - 1); break;
      case 'f': case 'F':
        if (document.fullscreenElement) document.exitFullscreen();
        else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
        break;
    }
  });

  /* ---- свайпы и колесо ---- */
  let touchX = 0, touchY = 0, wheelLock = false;

  document.addEventListener('touchstart', (e) => {
    touchX = e.changedTouches[0].clientX;
    touchY = e.changedTouches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? current + 1 : current - 1);
    }
  }, { passive: true });

  window.addEventListener('wheel', (e) => {
    const slide = slides[current];
    const atTop = slide.scrollTop <= 0;
    const atBottom = slide.scrollTop + slide.clientHeight >= slide.scrollHeight - 2;
    const scrollingDown = e.deltaY > 0;
    if ((scrollingDown && atBottom) || (!scrollingDown && atTop)) {
      if (wheelLock) return;
      wheelLock = true;
      setTimeout(() => wheelLock = false, 420);
      go(current + (scrollingDown ? 1 : -1));
    }
  }, { passive: true });

  /* ---- первый слайд ---- */
  slides[0].classList.add('active');
  dots[0].classList.add('active');
  prevBtn.disabled = true;
  progress.style.width = '0%';
  if (total === 1) nextBtn.disabled = true;
})();


/* ============================================================
   Карусель скриншотов (не конфликтует со свайпами слайдов)
   ============================================================ */
(function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var wrap = carousel.closest('.carousel-wrap');
    var slides = carousel.querySelectorAll('.carousel-slide');
    var prev = wrap.querySelector('.carousel-btn.prev');
    var next = wrap.querySelector('.carousel-btn.next');
    var dotsBox = wrap.querySelector('[data-dots]');
    var current = 0;

    if (!slides.length || !dotsBox) return;

    // Точки-индикаторы
    slides.forEach(function (_, i) {
      var d = document.createElement('button');
      d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Скриншот ' + (i + 1));
      d.addEventListener('click', function () { go(i); });
      dotsBox.appendChild(d);
    });
    var dots = dotsBox.querySelectorAll('.carousel-dot');

    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      current = i;
      var slide = slides[i];
      var offset = slide.offsetLeft - (carousel.clientWidth - slide.clientWidth) / 2;
      carousel.scrollTo({ left: offset, behavior: 'smooth' });
      dots.forEach(function (d, j) { d.classList.toggle('active', j === i); });
    }

    if (prev) prev.addEventListener('click', function () { go(current - 1); });
    if (next) next.addEventListener('click', function () { go(current + 1); });

    // Определение активного слайда после свайпа/скролла
    var scrollTimer;
    carousel.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        var center = carousel.scrollLeft + carousel.clientWidth / 2;
        var closest = 0, minDist = Infinity;
        slides.forEach(function (s, i) {
          var sCenter = s.offsetLeft + s.clientWidth / 2;
          var dist = Math.abs(center - sCenter);
          if (dist < minDist) { minDist = dist; closest = i; }
        });
        current = closest;
        dots.forEach(function (d, j) { d.classList.toggle('active', j === closest); });
      }, 100);
    });

    // Не даём свайпам по карусели переключать слайд презентации
    ['touchstart', 'touchmove', 'touchend', 'wheel'].forEach(function (evt) {
      carousel.addEventListener(evt, function (e) { e.stopPropagation(); }, { passive: true });
    });
  });
})();