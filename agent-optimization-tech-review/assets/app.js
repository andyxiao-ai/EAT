(function () {
  // Anchor smooth scroll + section hash highlight
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id.length > 1) {
        var el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, null, id);
        }
      }
    });
  });

  // Section progress indicator
  var sections = document.querySelectorAll('section[id]');
  var links = document.querySelectorAll('.toc a');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.id;
        links.forEach(function (l) {
          l.style.background = (l.getAttribute('href') === '#' + id) ? 'var(--bg2)' : 'none';
        });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
  sections.forEach(function (s) { observer.observe(s); });

  // Expandable abstract cards
  document.querySelectorAll('.card-meta .expand').forEach(function (b) {
    b.addEventListener('click', function () {
      var more = this.closest('.card-meta').querySelector('.more');
      if (more) {
        var hidden = more.style.display === 'none';
        more.style.display = hidden ? 'block' : 'none';
        this.textContent = hidden ? '收起 ↑' : '展开 ↓';
      }
    });
  });
})();
