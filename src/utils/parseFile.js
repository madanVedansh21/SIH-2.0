const fs = require('fs').promises;
const path = require('path');
const csvParse = require('csv-parse/lib/sync');
const xml2js = require('xml2js');

async function parseFile(filePath){
  const ext = path.extname(filePath).toLowerCase();
  const raw = await fs.readFile(filePath, 'utf8');
  if(ext === '.json'){
    try{ return JSON.parse(raw); }catch(e){ return { raw: raw }; }
  }
  if(ext === '.csv'){
    const records = csvParse(raw, { columns: true, skip_empty_lines: true });
    return { rows: records };
  }
  if(ext === '.xml'){
    const parsed = await xml2js.parseStringPromise(raw, { explicitArray: false, mergeAttrs: true });
    return parsed;
  }
  return { raw };
}

module.exports = { parseFile };
