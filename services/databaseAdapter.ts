import axios from 'axios';
import { BUCHAI_SERVER_URL } from '@/constants/Config';
import logger from '@/utils/logger';

export async function testQueryGithub() {
  const sqlQuery = `SELECT subject AS subject, COUNT(*) AS num_duplicates
FROM \`bigquery-public-data.github_repos.commits\`
GROUP BY subject 
ORDER BY num_duplicates 
DESC LIMIT 10`;

  try {
    const response = await axios.post(`${BUCHAI_SERVER_URL}/database/query`, {
      query: sqlQuery,
    });
    logger.info(JSON.stringify(response));

    const rows = response.data.data;

    logger.info('Rows:');
    rows.forEach((row: { subject: string; num_duplicates: number }) => logger.info(`${row.subject}: ${row.num_duplicates}`));
  } catch (error) {
    logger.error(`${error}`);
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  testQueryGithub();
}
