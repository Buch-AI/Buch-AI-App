// user authentication
// https://stepan.wtf/cloud-naming-convention/

import { BigQuery } from '@google-cloud/bigquery';

export async function queryGitHub() {
  // Create a client
  const bigqueryClient = new BigQuery();

  const location = 'europe-west2';

  // The SQL query to run
  const sqlQuery = `SELECT subject AS subject, COUNT(*) AS num_duplicates
  FROM \`bigquery-public-data.github_repos.commits\`
  GROUP BY subject 
  ORDER BY num_duplicates 
  DESC LIMIT 10`;

  const options = {
    query: sqlQuery,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'US',
    useQueryCache: false,
  };

  // Run the query
  const [rows] = await bigqueryClient.query(options);

  console.log('Rows:');
  rows.forEach((row) => console.log(`${row.subject}: ${row.num_duplicates}`));
}

queryGitHub();
