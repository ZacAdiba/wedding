document.getElementById('confirmBtn').addEventListener('click', async () => {
  const buyer = document.getElementById('buyerName').value.trim();
  if (!buyer) {
    alert('Please enter your name.');
    return;
  }

  try {
    console.log('Recording purchase via GET…');
    // Fire a simple GET with index & buyer in querystring
    const url = `${SHEET_URL}?index=${currentIndex}&buyer=${encodeURIComponent(buyer)}`;
    // Fetch (mode default) → no preflight
    await fetch(url);

    // Now re-fetch items and update UI
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
