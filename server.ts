import { config } from 'dotenv'; config();
import express from 'express';
import router from './router/route';

const HOST = process.env.HOST || 'localhost';
const PORT = parseInt(process.env.PORT) || 3000;
const app = express();

/** api routes */
app.use('/api', router);

app.listen(PORT, HOST, () => console.log(`✅ Server running on http://${HOST}:${PORT}/`));
