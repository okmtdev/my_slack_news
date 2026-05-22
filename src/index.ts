import express from 'express';
import path from 'path';
import { router as apiRouter } from './routes/api';

const app = express();
const PORT = parseInt(process.env.PORT ?? '8080', 10);

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT}`);
});

export default app;
