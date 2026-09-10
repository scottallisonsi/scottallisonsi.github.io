(() => {
  const data = JSON.parse(document.getElementById('book-data').textContent);
  const books = new Map(data.map(book => [book.id, book]));
  const grid = document.getElementById('books-grid');
  const cards = new Map([...grid.children].map(card => [card.dataset.id, card]));
  const search = document.getElementById('book-search');
  const rating = document.getElementById('rating-filter');
  const sort = document.getElementById('book-sort');
  const surprise = document.getElementById('surprise');
  const dialog = document.getElementById('book-dialog');
  const labels = {read:'Read','to-read':'Want to read','currently-reading':'Currently reading','did-not-finish':'Set aside'};
  const dateFormat = new Intl.DateTimeFormat('en', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const searchIndex = new Map(data.map(book => [book.id, normalize(`${book.title} ${book.author}`)]));
  const topics = new Set(data.map(book=>book.topic));
  let state = {topic:'all',query:'',rating:'all',sort:'added',view:'covers'};
  let matches = [];
  let lastPick = null;
  function readLocation() {
    const params = new URLSearchParams(location.search);
    state = {
      topic: topics.has(params.get('topic')) ? params.get('topic') : 'all',
      query: params.get('q') || '',
      rating: ['all','5','4','unrated'].includes(params.get('rating')) ? params.get('rating') : 'all',
      sort: ['added','rating','title','author'].includes(params.get('sort')) ? params.get('sort') : 'added',
      view: params.get('view') === 'spines' ? 'spines' : 'covers',
    };
  }
  function saveLocation() {
    const params = new URLSearchParams();
    if(state.topic !== 'all') params.set('topic',state.topic);
    if(state.query) params.set('q',state.query);
    if(state.rating !== 'all') params.set('rating',state.rating);
    if(state.sort !== 'added') params.set('sort',state.sort);
    if(state.view !== 'covers') params.set('view',state.view);
    const query = params.toString();
    try { history.replaceState(null,'',`${location.pathname}${query ? '?'+query : ''}${location.hash}`); } catch {}
  }
  function render(updateURL = true) {
    const terms = normalize(state.query.trim()).split(/\s+/).filter(Boolean);
    matches = data.filter(book =>
      (state.topic === 'all' || book.topic === state.topic) &&
      (state.rating === 'all' || (state.rating === 'unrated' ? book.rating === null : book.rating >= Number(state.rating))) &&
      terms.every(term => searchIndex.get(book.id).includes(term))
    );
    matches.sort((a,b) => {
      if(state.sort === 'title') return a.title.localeCompare(b.title);
      if(state.sort === 'author') return a.author.localeCompare(b.author) || a.title.localeCompare(b.title);
      if(state.sort === 'rating') return (b.rating || 0) - (a.rating || 0) || (b.added || '').localeCompare(a.added || '') || a.title.localeCompare(b.title);
      return (b.added || '').localeCompare(a.added || '') || a.title.localeCompare(b.title);
    });
    for(const card of cards.values()) card.hidden = true;
    const fragment = document.createDocumentFragment();
    for(const book of matches) {
      const card = cards.get(book.id);
      card.hidden = false;
      fragment.append(card);
    }
    grid.append(fragment);
    grid.classList.toggle('spines',state.view === 'spines');
    for(const button of document.querySelectorAll('[data-topic]')) button.setAttribute('aria-pressed',String(button.dataset.topic === state.topic));
    for(const mark of document.querySelectorAll('[data-mark-topic]')) mark.classList.toggle('dimmed',state.topic !== 'all' && mark.dataset.markTopic !== state.topic);
    for(const button of document.querySelectorAll('[data-view]')) button.setAttribute('aria-pressed',String(button.dataset.view === state.view));
    search.value = state.query;
    rating.value = state.rating;
    sort.value = state.sort;
    const filtered = state.topic !== 'all' || state.query.trim() || state.rating !== 'all';
    document.getElementById('results-count').textContent = `${matches.length}${filtered ? ` of ${data.length}` : ''} books read`;
    document.getElementById('clear-filters').hidden = !filtered;
    document.getElementById('empty-library').hidden = matches.length !== 0;
    surprise.disabled = !matches.length;
    if(updateURL) saveLocation();
  }
  function openBook(book) {
    document.getElementById('dialog-title').textContent = book.title;
    document.getElementById('dialog-author').textContent = `by ${book.author}`;
    document.getElementById('dialog-shelf').textContent = labels[book.shelf] || book.shelf;
    document.getElementById('dialog-rating').textContent = book.rating ? `My rating: ${book.rating} out of 5` : 'Not rated on Goodreads';
    document.getElementById('dialog-link').href = book.url;
    const cover = cards.get(book.id).querySelector('.cover-stage').cloneNode(true);
    const image = cover.querySelector('img');
    if(image) image.loading = 'eager';
    document.getElementById('dialog-cover').replaceChildren(cover);
    const facts = document.getElementById('dialog-facts');
    facts.replaceChildren();
    const fields = [['Published', book.published],['Pages', book.pages],['Added to shelf', book.added ? dateFormat.format(new Date(book.added)) : null],['Finished reading', book.read ? dateFormat.format(new Date(book.read)) : null]];
    for(const [name,value] of fields) {
      if(!value) continue;
      const term = document.createElement('dt');term.textContent = name;
      const detail = document.createElement('dd');detail.textContent = value;
      facts.append(term,detail);
    }
    if(!dialog.open) dialog.showModal();
  }
  document.getElementById('library-controls').hidden = false;
  surprise.hidden = false;
  document.addEventListener('error',event => {
    if(event.target instanceof HTMLImageElement && event.target.closest('.cover-stage')) event.target.remove();
  },true);
  for(const button of document.querySelectorAll('[data-topic]')) {
    button.disabled = false;
    button.addEventListener('click',()=>{state.topic=state.topic === button.dataset.topic ? 'all' : button.dataset.topic;render();});
  }
  for(const button of document.querySelectorAll('[data-view]')) button.addEventListener('click',()=>{state.view=button.dataset.view;render();});
  search.addEventListener('input',()=>{state.query=search.value;render();});
  rating.addEventListener('change',()=>{state.rating=rating.value;render();});
  sort.addEventListener('change',()=>{state.sort=sort.value;render();});
  function resetFilters() {state.topic='all';state.query='';state.rating='all';render();search.focus();}
  document.getElementById('reset-filters').addEventListener('click',resetFilters);
  document.getElementById('clear-filters').addEventListener('click',resetFilters);
  grid.addEventListener('click',event=>{
    const anchor = event.target.closest('.book-open');
    if(!anchor || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();openBook(books.get(anchor.closest('.book-card').dataset.id));
  });
  surprise.addEventListener('click',()=>{
    if(!matches.length) return;
    const choices = matches.length > 1 ? matches.filter(book=>book.id !== lastPick) : matches;
    const book = choices[Math.floor(Math.random()*choices.length)];
    lastPick=book.id;openBook(book);
  });
  document.getElementById('dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{
    const rect = dialog.getBoundingClientRect();
    if(event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  window.addEventListener('popstate',()=>{readLocation();render(false);});
  readLocation();render(false);
})();
