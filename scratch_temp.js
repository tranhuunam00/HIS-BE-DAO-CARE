const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to PG Database.');

    const resTemplates = await client.query(
      'SELECT id, staff_id, branch_id, day_of_week, shift_id, effective_date FROM his.staff_schedule_templates ORDER BY effective_date DESC'
    );
    console.log(`Total template records: ${resTemplates.rows.length}`);
    resTemplates.rows.forEach(row => {
      console.log(`Row ID: ${row.id}, Staff: ${row.staff_id}, Branch: ${row.branch_id}, Day: ${row.day_of_week}, Shift: ${row.shift_id}, Effective Date: ${row.effective_date}`);
    });

  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await client.end();
  }
}

run();
