import express from 'express';
import { resolveError } from './resolver.js';

const app = express();
app.use(express.json());

app.post('/resolve', (req, res) => {
    const { error } = req.body as { error?: unknown };
    if (typeof error !== 'string') {
        return res.status(400).json({ message: 'error must be a string' });
    }
    const resolution = resolveError(error);
    return res.json({ resolution });
});

export default app;

if (process.argv[1] === new URL(import.meta.url).pathname) {
    const port = Number(process.env.PORT) || 3000;
    app.listen(port, () => {
        console.log(`Reasoner listening on port ${port}`);
    });
}
