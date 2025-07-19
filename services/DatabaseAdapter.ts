import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing
import sqlString from 'sqlstring'; // Import sqlstring for escaping SQL inputs
import { BUCHAI_SERVER_URL } from '@/constants/Config';
import Logger from '@/utils/Logger';
import axios from './AxiosInterceptor';

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
    Logger.info(JSON.stringify(response));

    const rows = response.data.data;

    Logger.info('Rows:');
    rows.forEach((row: { subject: string; num_duplicates: number }) => Logger.info(`${row.subject}: ${row.num_duplicates}`));
  } catch (error) {
    Logger.error(`${error}`);
  }
}

// Function to check if a user already exists
async function userExists(userId: string): Promise<boolean> {
  const sqlQuery = `
    SELECT COUNT(*) as count FROM \`bai-buchai-p.users.auth\`
    WHERE user_id = ${sqlString.escape(userId)}
  `;

  try {
    const response = await axios.post(`${BUCHAI_SERVER_URL}/database/query`, {
      query: sqlQuery,
    });
    const count = response.data.data[0].count;
    return count > 0; // Return true if user exists
  } catch (error) {
    Logger.error(`Error checking user existence: ${error}`);
    throw error; // Rethrow the error for handling in the component
  }
}

// Function to authenticate user
export async function authenticateUser(email: string, password: string): Promise<boolean> {
  const sqlQuery = `
    SELECT password_hash FROM \`bai-buchai-p.users.auth\`
    WHERE email = ${sqlString.escape(email)}
  `;

  try {
    const response = await axios.post(`${BUCHAI_SERVER_URL}/database/query`, {
      query: sqlQuery,
    });
    const user = response.data.data[0];

    if (user) {
      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      return isMatch; // Return true if passwords match
    }
    return false; // User not found
  } catch (error) {
    Logger.error(`Error authenticating user: ${error}`);
    throw error; // Rethrow the error for handling in the component
  }
}

export async function registerUser(userData: {
  user_id: string;
  username: string;
  email: string;
  password: string;
}) {
  const hashedPassword = await bcrypt.hash(userData.password, 10); // Hash the password

  // Check if user already exists
  const exists = await userExists(userData.user_id);
  if (exists) {
    throw new Error('User with this user_id already exists.');
  }

  // Use sqlString to escape user inputs
  const sanitizedUserId = sqlString.escape(userData.user_id);
  const sanitizedUsername = sqlString.escape(userData.username);
  const sanitizedEmail = sqlString.escape(userData.email);
  const sanitizedPasswordHash = `'${hashedPassword}'`; // Already hashed

  const sqlQuery = `
    INSERT INTO \`bai-buchai-p.users.auth\` (user_id, username, email, password_hash, created_at, is_active)
    VALUES (${sanitizedUserId}, ${sanitizedUsername}, ${sanitizedEmail}, ${sanitizedPasswordHash}, CURRENT_TIMESTAMP(), TRUE)
  `;

  try {
    const response = await axios.post(`${BUCHAI_SERVER_URL}/database/query`, {
      query: sqlQuery,
    });
    Logger.info(`User registered: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error) {
    Logger.error(`Registration error: ${error}`);
    throw error; // Rethrow the error for handling in the component
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  testQueryGithub();
}
