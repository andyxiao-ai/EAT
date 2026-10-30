(function(){
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=this.getAttribute('href'); if(id.length<=1) return;
      var el=document.querySelector(id); if(!el) return;
      e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'});
      history.replaceState(null,null,id);
    });
  });
  var sections=document.querySelectorAll('section[id]');
  var links=document.querySelectorAll('.toc a');
  var ob=new IntersectionObserver(function(entries){
    entries.forEach(function(ent){
      if(ent.isIntersecting){
        var id=ent.target.id;
        links.forEach(function(l){ l.style.background = (l.getAttribute('href')==='#'+id) ? 'var(--bg2)' : 'none'; });
      }
    });
  },{rootMargin:'-20% 0px -70% 0px',threshold:0});
  sections.forEach(function(s){ ob.observe(s); });

  // Expandable quote
  document.querySelectorAll('.expand').forEach(function(b){
    b.addEventListener('click',function(){
      var more=this.closest('.card').querySelector('.more');
      if(!more) return;
      var hidden=more.style.display==='none';
      more.style.display=hidden?'block':'none';
      this.textContent=hidden?'展开 ↓':'收起 ↑';
    });
  });
})();
