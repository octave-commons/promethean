import express from 'express';
import screenshot from 'screenshot-desktop';

export const app = express();
let capture = async () => screenshot({ format: 'png' });
if (process.env.VISION_STUB) {
  capture = async () => Buffer.from('stub');
}

export function setCaptureFn(fn) {
  capture = fn;
}

export function start(port = process.env.PORT || 5003) {
  return app.listen(port, () => {
    console.log(`vision service listening on ${port}`);
  });
}

app.get('/capture', async (req, res) => {
  try {
    const img = await capture();
    res.set('Content-Type', 'image/png');
    res.send(img);
  } catch (err) {
    console.error('capture failed', err);
    res.status(500).send('capture failed');
  }
});

if (process.env.NODE_ENV !== 'test') {
  start();
}
