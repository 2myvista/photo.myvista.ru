import 'dotenv/config';

const requiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Required environment variable is not set: ${name}`);
  }

  return value;
};

export const config = {
  backendFunctionId: requiredEnv('BACKEND_FUNCTION_ID'),

  ydb: {
    endpoint: requiredEnv('YDB_ENDPOINT'),
    database: requiredEnv('YDB_DATABASE'),
  },
};