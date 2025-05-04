document.getElementById('confirmBtn').addEventListener('click', async () => {
  const buyer = document.getElementById('buyerName').value.trim();
  if (!buyer) {
    alert('Please enter your name.');
    return;
  }

  try {
    // build a simple form body
    const form = new URLSearchParams();
    form.append('index', currentIndex);
    form.append('buyer', buyer);

    console.log('Posting purchase…', {index: currentIndex, buyer});
    const postRes = await fetch(SHEET_URL, {
      method: 'POST',
      body: form
    });
    const text = await postRes.text();
    console.log('Post response:', text);

    if (!postRes.ok || text.substring(0,2) !== 'OK') {
      throw new Error(text);
    }

    // refresh & redirect
    const items = await fetchItems();
    renderRegistry(items);
    hideModal();

    const item = items[currentIndex];
    const url  = new URL('https://settleup.starlingbank.com/zacharyellis');
    url.searchParams.set('amount', item.Price);
    url.searchParams.set('message', item.Name);
    window.location.href = url.toString();
  }
  catch(err) {
    console.error('Purchase error:', err);
    alert('Oops—could not record your gift. Please try again.');
  }
});
