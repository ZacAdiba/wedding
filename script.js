// ← your updated Apps-Script Web App URL here:
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwiJr…/exec';

document.addEventListener('DOMContentLoaded', () => {
  let currentIndex = null;

  async function fetchItems() {
    console.log('Fetching items…');
    const res = await fetch(SHEET_URL);
    const items = await res.json();
    console.log('Items:', items);
    return items;
  }

  function renderRegistry(items) {
    const container = document.getElementById('registry');
    container.innerHTML = '';
    items.forEach((it, idx) => {
      const div = document.createElement('div');
      div.className = 'item' + (it.Taken ? ' unavailable' : '');
      div.innerHTML = `
        <img src="${it.ImageURL}" alt="${it.Name}">
        <h3>${it.Name}</h3>
        <p>£${it.Price}</p>
        <button ${it.Taken ? 'disabled' : ''} data-idx="${idx}">
          ${it.Taken ? 'Unavailable' : "I'll buy it"}
        </button>
      `;
      container.append(div);
    });
    attachButtons();
  }

  function attachButtons() {
    document.querySelectorAll('button[data-idx]').forEach(btn => {
      btn.onclick = () => showModal(btn.dataset.idx);
    });
  }

  function showModal(index) {
    currentIndex = index;
    document.getElementById('buyerName').value = '';
    document.getElementById('modal').classList.add('active');
  }
  function hideModal() {
    document.getElementById('modal').classList.remove('active');
  }
  document.getElementById('cancelBtn').addEventListener('click', hideModal);

  document.getElementById('confirmBtn').addEventListener('click', async () => {
    const buyer = document.getElementById('buyerName').value.trim();
    if (!buyer) {
      alert('Please enter your name.');
      return;
    }

    try {
      console.log('Posting purchase:', { index: currentIndex, buyer });
      const postRes = await fetch(SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: currentIndex, buyer })
      });
      const postData = await postRes.json();
      console.log('Post response:', postData);

      if (!postData.success) {
        throw new Error(postData.error || 'Unknown error');
      }

      // Refresh the list
      const items = await fetchItems();
      renderRegistry(items);
      hideModal();

      // Redirect to Starling
      const item = items[currentIndex];
      const url = new URL('https://settleup.starlingbank.com/zacharyellis');
      url.searchParams.set('amount', item.Price);
      url.searchParams.set('message', item.Name);
      window.location.href = url;
    } catch (err) {
      console.error('Error in purchase flow:', err);
      alert('Sorry, something went wrong. Please try again or contact us.');
    }
  });

  // Initial load
  fetchItems().then(renderRegistry);
});
