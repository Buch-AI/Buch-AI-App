/**
 * Modified from https://codelabs.developers.google.com/codelabs/cloud-bigquery-nodejs#9.
 */

'use strict';

async function main() {
  // Import the Google Cloud client libraries
  const { BigQuery } = require('@google-cloud/bigquery');

  const datasetId = 'users';
  const tableId = 'auth';

  const location = 'europe-west2';

  async function createDataset(datasetId) {
    const bigqueryClient = new BigQuery();

    // Specify the geographic location where the dataset should reside
    const options = {
      location: location,
    };

    // Create a new dataset
    const [dataset] = await bigqueryClient.createDataset(datasetId, options);
    console.log(`Dataset ${dataset.id} created.`);

    return dataset.id;
  }

  async function createTable(datasetId, tableId) {
    // Create a client
    const bigqueryClient = new BigQuery();

    const options = {
      location: location,
      schema: {
        fields: [
          { name: 'user_id', type: 'STRING', mode: 'REQUIRED' }, // Unique identifier for the user
          { name: 'username', type: 'STRING', mode: 'REQUIRED' }, // Username chosen by the user
          { name: 'email', type: 'STRING', mode: 'REQUIRED' }, // User's email address
          { name: 'password_hash', type: 'STRING', mode: 'REQUIRED' }, // Hashed password
          { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' }, // Account creation timestamp
          { name: 'last_login', type: 'TIMESTAMP', mode: 'NULLABLE' }, // Timestamp of the last login
          { name: 'is_active', type: 'BOOLEAN', mode: 'REQUIRED' }, // Indicates if the account is active
          { name: 'roles', type: 'STRING', mode: 'REPEATED' }, // List of roles assigned to the user
          // { name: 'profile', type: 'RECORD', mode: 'NULLABLE', fields: [ // Nested record for user profile
          //   { name: 'first_name', type: 'STRING', mode: 'NULLABLE' },
          //   { name: 'last_name', type: 'STRING', mode: 'NULLABLE' },
          //   { name: 'date_of_birth', type: 'DATE', mode: 'NULLABLE' },
          //   { name: 'phone_number', type: 'STRING', mode: 'NULLABLE' }
          // ]}
        ],
      },
    };

    // Create a new table in the dataset
    const [table] = await bigqueryClient
      .dataset(datasetId)
      .createTable(tableId, options);

    console.log(`Table ${table.id} created.`);
  }

  await createDataset(datasetId);
  await createTable(datasetId, tableId);
}

main();
