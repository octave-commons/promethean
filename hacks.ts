(async () => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/key', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching API key: ${response.statusText}`);
    }

    console.log('hello world');

    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.error('Error:', err);
  }
})();
