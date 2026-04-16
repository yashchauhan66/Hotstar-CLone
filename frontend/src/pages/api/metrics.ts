import { NextApiRequest, NextApiResponse } from 'next';
import { register, collectDefaultMetrics } from 'prom-client';

// We assign it to a global variable to prevent it from being registered multiple times
// during Next.js hot-reloads or multiple hits.
const globalAny: any = global;

if (!globalAny._promClientMetricsRegistered) {
  collectDefaultMetrics();
  globalAny._promClientMetricsRegistered = true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.status(200).send(metrics);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
