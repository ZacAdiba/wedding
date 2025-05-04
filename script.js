const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwiJrCEtBXb_YBdTj2DsrHbLpds6X5o0JEVQuo4IG4AhPrMJDwkLmzeu_4xf4IcF94nCQ/exec';

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
    btn.onclick = () => openPrompt(btn.dataset.idx);
  });
}

function openPrompt(index) {
  const buyer = prompt("Enter your name to confirm:");
  if (!buyer) return;
  purchaseItem(index, buyer);
}

async function purchaseItem(idx, buyer) {
  await fetch(SHEET_URL, {
    method: 'POST',
    body: JSON.stringify({ index: idx, buyer }),
    headers: { 'Content-Type': 'application/json' }
  });
  // reload data & UI
  const items = await fetchItems();
  renderRegistry(items);

  // redirect to SettleUp
  const item = items[idx];
  const url = new URL('https://settleup.starlingbank.com/zacharyellis');
  url.searchParams.set('amount', item.Price);
  url.searchParams.set('message', item.Name);
  window.location.href = url.toString();
}

// init
fetchItems().then(renderRegistry);