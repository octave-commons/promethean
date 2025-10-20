import test from "ava";
import { embedAttachments } from "../index.js";

test("embeds attachments into provider+tenant namespace", async (t) => {
  const fakeFetch: typeof fetch = async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : String(input);
    if (url.endsWith("img"))
      return new Response(Buffer.from("img"), {
        headers: { "content-type": "image/png" },
      });
    return new Response("hello", {
      headers: { "content-type": "text/plain" },
    });
  };
  const out = await embedAttachments(
    {
      message_id: "m1",
      attachments: [
        {
          urn: "urn:discord:attachment:duck:a1",
          url: "https://cdn/img",
          content_type: "image/png",
        },
        {
          urn: "urn:discord:attachment:duck:a2",
          url: "https://cdn/txt",
          content_type: "text/plain",
        },
      ],
      provider: "discord",
      tenant: "duck",
    },
    {
      chromaUrl: "http://localhost:8000",
      dim: 8,
      textModelId: "text:v1",
      imageModelId: "image:v1",
      fetch: fakeFetch,
      providerConfigPath: new URL(
        "../../../../config/providers.yml",
        import.meta.url,
      ).pathname,
    },
  );
  t.regex(out.ns, /discord__duck/);
  t.is(out.ids.length, 2);
  t.true(out.ids.every((id) => id.startsWith("discord:duck:attachment:")));
});
