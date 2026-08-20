export const handler = async () => {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            success: true,
        }),
    };
};


import { checkYdbConnection } from './db/check';

checkYdbConnection().catch((error) => {
  console.error(error);
  process.exit(1);
});