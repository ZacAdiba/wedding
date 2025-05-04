// Replace this with your deployed Apps Script URL:
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwiJrCEtBXb_YBdTj2DsrHbLpds6X5o0JEVQuo4IG4AhPrMJDwkLmzeu_4xf4IcF94nCQ/exec';

document.addEventListener('DOMContentLoaded', () => {
  let currentIndex = null;

  // Fetch registry items
  async function fetchItems() {
    const res = await fetch(SHEET_URL);
    return res.json();
  }

  // Render the grid
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

  // Wire up buttons
  function attachButtons() {
    document.querySelectorAll('button[data-idx]').forEach(btn => {
      btn.onclick = () => showModal(btn.dataset.idx);
    });
  }

  // Modal control
  function showModal(index) {
    currentIndex = index;
    document.getElementById('buyerName').value = '';
    document.getElementById('modal').classList.add('active');
  }
  function hideModal() {
    document.getElementById('modal').classList.remove('active');
  }
  document.getElementById('cancelBtn').addEventListener('click', hideModal);

  // Confirm purchase
  document.getElementById('confirmBtn').addEventListener('click', async () => {
    const buyer = document.getElementById('buyerName').value.trim();
    if (!buyer) {
      alert('Please enter your name.');
      return;
    }

    // Send to Google Sheets
    await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index: currentIndex, buyer })
    });

    // Refresh, close modal
    const items = await fetchItems();
    renderRegistry(items);
    hideModal();

    // Redirect to payment
    const item = items[currentIndex];
    const url = new URL('https://settleup.starlingbank.com/zacharyellis');
    url.searchParams.set('amount', item.Price);
    url.searchParams.set('message', item.Name);
    window.location.href = url.toString();
  });

  // Initial load
  fetchItems().then(renderRegistry);
});
