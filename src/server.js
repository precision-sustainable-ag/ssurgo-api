import { setup } from './app.js';
import apiRoutes from './routes/api.js';

await setup({
  title: 'SSURGO API',
  version: '1.0.0',
  trusted: ['https://ssurgo.covercrop-data.org', 'https://developssurgo.covercrop-data.org'],
  plugins: {
    '': apiRoutes,
  },
});
