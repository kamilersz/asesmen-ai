import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from "fs/promises";
import fs2 from "fs"

dotenv.config();
const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});
const filePath = 'uploads/0fb1bf45b65617c8e7d9da2200bcdef4.webm';
const fileHandle = await fs.open(filePath, 'r');
const transcription = await client.audio.transcriptions.create({
  file: fs2.createReadStream(filePath),
  model: "whisper-1",
  language: 'id',
});

console.log('transcription', transcription)