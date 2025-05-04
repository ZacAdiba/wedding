// YOUR Apps Script Web App URL:
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwiJrCEtBXb_YBdTj2DsrHbLpds6X5o0JEVQuo4IG4AhPrMJDwkLmzeu_4xf4IcF94nCQ/exec';

let currentIndex = null;

// 1) Fetch all items from your Google Sheet
async function fetchItems() {
  const res = await fetch(SHEET_URL);
  return res.json();
}

// 2) Render them in the grid
function renderRegistry(items) {
  const container = document.getElementById('registry');
  container.innerHTML = '';
  items.forEach((it, idx) => {
    const div = document.createElement('div');
    div.className = 'item' + (it.Taken === true ? ' unavailable' : '');
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

// 3) Wire up each “buy” button to open the modal
function attachButtons() {
  document.querySelectorAll('button[data-idx]').forEach(btn => {
    btn.onclick = () => showModal(btn.dataset.idx);
  });
}

// 4) Show / hide modal
function showModal(index) {
  currentIndex = index;
  document.getElementById('buyerName').value = '';
  document.getElementById('modal').classList.add('active');
}
function hideModal() {
  document.getElementById('modal').classList.remove('active');
}
document.getElementById('cancelBtn').addEventListener('click', hideModal);

// 5) Confirm purchase, POST back to Sheet, refresh UI, then redirect
document.getElementById('confirmBtn').addEventListener('click', async () => {
  const buyer = document.getElementById('buyerName').value.trim();
  if (!buyer) {
    alert('Please enter your name.');
    return;
  }

  // POST to Apps Script
  await fetch(SHEET_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index: currentIndex, buyer })
  });

  // Refresh grid
  const items = await fetchItems();
  renderRegistry(items);
  hideModal();

  // Redirect to Starling with dynamic amount & message
  const item = items[currentIndex];
  const url = new URL('https://settleup.starlingbank.com/zacharyellis');
  url.searchParams.set('amount', item.Price);
  url.searchParams.set('message', item.Name);
  window.location.href = url.toString();
});

// 6) Initial load
fetchItems().then(renderRegistry);
