const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwiJrCEtBXb_YBdTj2DsrHbLpds6X5o0JEVQuo4IG4AhPrMJDwkLmzeu_4xf4IcF94nCQ/exec';
let currentIndex = null;

async function fetchItems() {
  const res = await fetch(SHEET_URL);
  return res.json();
}

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
      <button ${it.Taken === true ? 'disabled' : ''} data-idx="${idx}">
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
document.getElementById('confirmBtn').addEventListener('click', () => {
  const buyer = document.getElementById('buyerName').value.trim();
  if (!buyer) {
    alert('Please enter your name.');
    return;
  }
  purchaseItem(currentIndex, buyer);
});

async function purchaseItem(idx, buyer) {
  await fetch(SHEET_URL, {
    method: 'POST',
    body: JSON.stringify({ index: idx, buyer }),
    headers: { 'Content-Type': 'application/json' }
  });
  const items = await fetchItems();
  renderRegistry(items);
  hideModal();

  const item = items[idx];
  const url = new URL('https://settleup.starlingbank.com/zacharyellis');
  url.searchParams.set('amount', item.Price);
  url.searchParams.set('message', item.Name);
  window.location.href = url.toString();
}

// Initialize
fetchItems().then(renderRegistry);
