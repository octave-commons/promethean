const chat = document.getElementById('chat');
const form = document.getElementById('form');
const input = document.getElementById('message');

const context = [];
const prompt = 'You are a helpful assistant';

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = input.value.trim();
    if (!content) return;
    appendMessage('user', content);
    input.value = '';
    context.push({ role: 'user', content });
    const res = await fetch('/llm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
    });
    const data = await res.json();
    appendMessage('assistant', data.reply);
    context.push({ role: 'assistant', content: data.reply });
});

function appendMessage(role, content) {
    const el = document.createElement('div');
    el.textContent = `${role}: ${content}`;
    chat.appendChild(el);
}
