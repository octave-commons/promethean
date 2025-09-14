const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("message");

const context = [];
const prompt = `You are a helpful assistant. If a tool is required, reply with JSON {"tool":name,"args":{...}} and no other text.`;

import { parseToolCall, callTool } from "./tools.js";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = input.value.trim();
  if (!content) return;
  appendMessage("user", content);
  input.value = "";
  context.push({ role: "user", content });
  const res = await fetch("/llm/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, context }),
  });
  const data = await res.json();
  const tool = parseToolCall(data.reply);
  if (tool) {
    appendMessage("assistant", `Calling tool ${tool.tool}...`);
    const result = await callTool(tool.tool, tool.args);
    appendMessage("assistant", JSON.stringify(result));
    context.push({ role: "assistant", content: JSON.stringify(result) });
  } else {
    appendMessage("assistant", data.reply);
    context.push({ role: "assistant", content: data.reply });
  }
});

function appendMessage(role, content) {
  const el = document.createElement("div");
  el.textContent = `${role}: ${content}`;
  chat.appendChild(el);
}
