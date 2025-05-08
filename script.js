// Your Apps Script Web App URL:
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwiJrCEtBXb_YBdTj2DsrHbLpds6X5o0JEVQuo4IG4AhPrMJDwkLmzeu_4xf4IcF94nCQ/exec';

document.addEventListener('DOMContentLoaded', () => {
  let currentIndex = null;
  const spinner   = document.getElementById('spinner');
  const modalBtns = document.querySelector('.modal-buttons');

  async function fetchItems() {
    const res = await fetch(SHEET_URL);
    return res.json();
  }

  function renderRegistry(items) {
    const container = document.getElementById('registry');
    container.innerHTML = '';
    items.forEach((it, idx) => {
      const div = document.createElement('div');
      div.className = 'item' + (it.Taken ? ' unavailable' : '');
      div.innerHTML = `
        <img src="${it.ImageURL}" alt="${it.Name}">
        <div class="item-header">
          <h3>${it.Name}</h3>
          <span class="price">£${it.Price}</span>
        </div>
        <button ${it.Taken ? 'disabled' : ''} data-idx="${idx}">
          ${it.Taken ? 'Unavailable' : "I'll buy it"}
        </button>
      `;
      container.append(div);
    });
    container.querySelectorAll('button[data-idx]').forEach(btn =>
      btn.onclick = () => showModal(btn.dataset.idx)
    );
  }

  function showModal(idx) {
    currentIndex = idx;
    document.getElementById('buyerName').value = '';
    spinner.hidden   = true;
    modalBtns.style.display = 'flex';
    document.getElementById('modal').classList.add('active');
  }

  function hideModal() {
    document.getElementById('modal').classList.remove('active');
  }
  document.getElementById('cancelBtn').onclick = hideModal;

  document.getElementById('confirmBtn').onclick = async () => {
    const buyer = document.getElementById('buyerName').value.trim();
    if (!buyer) return alert('Please enter your name.');

    spinner.hidden         = false;
    modalBtns.style.display = 'none';

    // fire-and-forget purchase call
    fetch(`${SHEET_URL}?index=${currentIndex}&buyer=${encodeURIComponent(buyer)}`)
      .catch(console.error);

    // immediate redirect
    const items = await fetchItems();
    const item  = items[currentIndex];
    window.location.href =
      `https://settleup.starlingbank.com/zacharyellis?amount=${item.Price}&message=${encodeURIComponent(item.Name)}`;
  };

  fetchItems().then(renderRegistry);
});
