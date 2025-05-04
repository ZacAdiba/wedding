// Replace with your deployed Apps Script Web App URL
the const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwiJrCEtBXb_YBdTj2DsrHbLpds6X5o0JEVQuo4IG4AhPrMJDwkLmzeu_4xf4IcF94nCQ/exec';

document.addEventListener('DOMContentLoaded', () => {
  let currentIndex = null;

  // 1) Fetch registry items (JSON) from your Apps Script
  async function fetchItems() {
    console.log('Fetching items…');
    const res = await fetch(SHEET_URL);
    const items = await res.json();
    console.log('Items:', items);
    return items;
  }

  // 2) Render the grid of gifts
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

  // 3) Hook up “I’ll buy it” buttons to open modal
  function attachButtons() {
    document.querySelectorAll('button[data-idx]').forEach(btn => {
      btn.onclick = () => showModal(btn.dataset.idx);
    });
  }

  // 4) In-page modal show/hide logic
  function showModal(index) {
    currentIndex = index;
    document.getElementById('buyerName').value = '';
    document.getElementById('modal').classList.add('active');
  }
  function hideModal() {
    document.getElementById('modal').classList.remove('active');
  }
  document.getElementById('cancelBtn').addEventListener('click', hideModal);

  // 5) Confirm purchase: send GET, refresh UI, redirect
  document.getElementById('confirmBtn').addEventListener('click', async () => {
    const buyer = document.getElementById('buyerName').value.trim();
    if (!buyer) {
      alert('Please enter your name.');
      return;
    }

    try {
      console.log('Recording purchase via GET…');
      // Simple GET params to avoid CORS preflight
      const url = `${SHEET_URL}?index=${currentIndex}&buyer=${encodeURIComponent(buyer)}`;
      await fetch(url);  // doGet handles writing & returns JSON

      // Re-fetch items and update UI
      const items = await fetchItems();
      renderRegistry(items);
      hideModal();

      // Redirect to Starling with dynamic amount & message
      const item = items[currentIndex];
      const payUrl = new URL('https://settleup.starlingbank.com/zacharyellis');
      payUrl.searchParams.set('amount', item.Price);
      payUrl.searchParams.set('message', item.Name);
      window.location.href = payUrl.toString();

    } catch (err) {
      console.error('Error in purchase flow:', err);
      alert('Sorry, something went wrong. Please try again.');
    }
  });

  // 6) Initial load
  fetchItems().then(renderRegistry);
});
