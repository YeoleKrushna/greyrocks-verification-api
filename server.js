import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const allowedOrigins = new Set(['https://greyrocks.in', 'https://www.greyrocks.in', 'http://localhost:4321', 'http://127.0.0.1:4321']);
let pool;

app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.has(origin));
  },
}));
app.use(express.json());

function getPool() {
  if (!process.env.NEON_DB) throw new Error('Database is not configured');
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.NEON_DB,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    pool.on('error', () => {
      console.error('[db] Unexpected connection pool error.');
    });
  }
  return pool;
}

const normalizeId = (value) => (typeof value === 'string' ? value.trim().toUpperCase() : '');
const isValidCertificateId = (id) => /^GR-[A-Z0-9]{1,12}-\d{4}-[A-Z0-9]{3,12}$/.test(id);

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/api/verification/:id', async (request, response) => {
  const credentialId = normalizeId(request.params.id);
  if (!isValidCertificateId(credentialId)) {
    return response.status(404).json({ verified: false, error: 'Certificate not found' });
  }

  try {
    const result = await getPool().query(
      'SELECT credential_id, name, domain, duration FROM certificates WHERE credential_id = $1 LIMIT 1',
      [credentialId],
    );
    const row = result.rows[0];
    if (!row) {
      return response.status(404).json({ verified: false, error: 'Certificate not found' });
    }
    return response.json({
      verified: true,
      certificate: {
        credential_id: row.credential_id,
        name: row.name,
        domain: row.domain,
        duration: row.duration,
      },
    });
  } catch {
    console.error('[verification] Database lookup failed.');
    return response.status(503).json({
      verified: false,
      error: 'Verification service temporarily unavailable',
    });
  }
});

const port = Number(process.env.PORT) || 10000;
app.listen(port, '0.0.0.0', () => {
  console.log(`GreyRocks verification API listening on port ${port}.`);
});