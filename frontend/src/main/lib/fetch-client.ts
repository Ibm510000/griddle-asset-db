import createClient from 'openapi-fetch';
import type { paths } from '../../types/schema';

const fetchClient = (createClient as unknown as { default: typeof createClient }).default<paths>({
  baseUrl: import.meta.env.VITE_BACKEND_URL,
});

export default fetchClient;
