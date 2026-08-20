import driver from './ydb';

export async function checkYdbConnection(): Promise<void> {
  const ready = await driver.ready(10_000);

  if (!ready) {
    throw new Error('YDB driver has not become ready in 10 seconds');
  }

  console.log('YDB connection established');
}