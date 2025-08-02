import express from "express";
import ollama from "ollama";

export const MODEL = process.env.LLM_MODEL || "gemma3:latest";

export const app = express();
app.use(express.json({ limit: "100mb" }));

export async function callOllama({ prompt, context, format }, retry = 0) {
  try {
    const res = await ollama.chat({
      model: MODEL,
      messages: [{ role: "system", content: prompt }, ...context],
      format,
    });
    const content = res.message.content;
    return format ? JSON.parse(content) : content;
  } catch (err) {
    if (retry < 5) {
      await new Promise((r) => setTimeout(r, retry * 1610));
      return callOllama({ prompt, context, format }, retry + 1);
    }
    throw err;
  }
}

app.post("/generate", async (req, res) => {
  const { prompt, context, format } = req.body;
    for (let m of context) {
        console.log("message:",m)
        if(m.images) {
            console.log("image data:")
            for(let imageData of m.images) {
                console.log(imageData.type)
                console.log(imageData.data)
            }
            m.images = m.images.map(img => new Uint8Array(img.data))

        }
    }
    console.log("root prompt",prompt)
    console.log("format",format||"string")
  try {
    const reply = await callOllama({ prompt, context, format });
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export const port = process.env.LLM_PORT || 5003;

export function start(listenPort = port) {
  return app.listen(listenPort, () => {
    console.log(`LLM service listening on ${listenPort}`);
  });
}

if (process.env.NODE_ENV !== "test") {
  start();
}
