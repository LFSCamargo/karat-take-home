import { createApp } from './app';
import { serverEnv } from './config/env';

const app = createApp();

app.listen(serverEnv.port, () => {
  console.log(`API listening on http://localhost:${serverEnv.port}`);
});
