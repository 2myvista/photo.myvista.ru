import { Driver, TokenAuthService } from 'ydb-sdk';

import { config } from '../config';

const token = process.env.YC_IAM_TOKEN;

if (!token) {
  throw new Error('YC_IAM_TOKEN is not set');
}

const driver = new Driver({
  endpoint: config.ydb.endpoint,
  database: config.ydb.database,
  authService: new TokenAuthService(token),
});

export default driver;