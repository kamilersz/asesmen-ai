import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs';
import util from 'util';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

// Creates a client
const client = new textToSpeech.TextToSpeechClient();

async function checkFileExists(filePath) {
  try {
    await fs.promises.access(filePath, fs.promises.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

async function tts(text) {
  const hash = sha256(text)
  const pathvoice = 'voice/' + hash + '.wav'
  if (await checkFileExists(pathvoice)) {
    return pathvoice
  }
  // Construct the request
  const request = {
    input: {text: text},
    // Select the language and SSML voice gender (optional)
    voice: {
      languageCode: 'id-ID',
      name: 'id-ID-Standard-B',
    },
    // Select the type of audio encoding
    audioConfig: {
      audioEncoding: 'LINEAR16',
      speakingRate: 1.1,
      pitch: 5,
    },
  };

  // Performs the text-to-speech request
  const [response] = await client.synthesizeSpeech(request);
  
  // Write the binary audio content to a local file
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(pathvoice, response.audioContent, 'binary');
  console.log('Audio content written to file: '+hash+'.wav');
  return pathvoice
}

console.log(await tts('Selamat Datang di Wawancara asesor'))