const fs = require('fs').promises;
const path = require('path');
const csvParse = require('csv-parse/lib/sync');
const xml2js = require('xml2js');

async function parseFile(input){
  // input can be an object { buffer, originalname } or a filePath string
  let ext;
  let raw;
  if(typeof input === 'string'){
    ext = path.extname(input).toLowerCase();
    raw = await fs.readFile(input, 'utf8');
  }else if(input && input.buffer){
    ext = path.extname(input.originalname || '').toLowerCase();
    raw = input.buffer.toString('utf8');
  }else{
    return { raw: '' };
  }
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
