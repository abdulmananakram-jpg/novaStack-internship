const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'data');

async function readJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const raw = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readJSON, writeJSON };
