// lib/dexieDatabase.js
import Dexie from "dexie";

// Initialize the database function
const initializeDatabase = () => {
  const db = new Dexie("AudioDatabase");
  db.version(1).stores({
    audioFiles: "++id,name,blob", // Stores files with an auto-incremented id
  });
  return db;
};

// Initialize the database
let db = initializeDatabase();

// Function to clear all data and reset the auto-increment ID
export const clearDatabase = async () => {
  try {
    await db.delete(); // Deletes the entire database, including schema and data
    db = initializeDatabase(); // Reinitialize the database with the schema
    // console.log("Database cleared and reset successfully.");
  } catch (error) {
    // console.error("Failed to reset database:", error);
  }
};

// Function to save audio to IndexedDB, ensuring a cleared database each time
export const saveAudioToIndexedDB = async (fileName, fileUrl) => {
  try {
    const response = await fetch(fileUrl);
    const audioBlob = await response.blob();

    await db.audioFiles.add({
      name: fileName,
      blob: audioBlob,
    });

    return true;
  } catch (error) {
    // console.error("Error saving audio file:", error);
  }
};

// Function to get audio from IndexedDB
export const getAudioFromIndexedDB = async (fileName) => {
  try {
    const audioFile = await db.audioFiles
      .where("name")
      .equals(fileName)
      .first();
    return audioFile ? URL.createObjectURL(audioFile.blob) : null;
  } catch (error) {
    // console.error("Error retrieving audio file:", error);
  }
};

// Function to load and verify all required audio files
export const checkAudioFilesLoaded = async () => {
  const audioKeys = [
    "start",
    "stop",
    "bingo",
    "shuffle",
    "b1Audio",
    "b2Audio",
    "b3Audio",
    "b4Audio",
    "b5Audio",
    "b6Audio",
    "b7Audio",
    "b8Audio",
    "b9Audio",
    "b10Audio",
    "b11Audio",
    "b12Audio",
    "b13Audio",
    "b14Audio",
    "b15Audio",
    "i16Audio",
    "i17Audio",
    "i18Audio",
    "i19Audio",
    "i20Audio",
    "i21Audio",
    "i22Audio",
    "i23Audio",
    "i24Audio",
    "i25Audio",
    "i26Audio",
    "i27Audio",
    "i28Audio",
    "i29Audio",
    "i30Audio",
    "n31Audio",
    "n32Audio",
    "n33Audio",
    "n34Audio",
    "n35Audio",
    "n36Audio",
    "n37Audio",
    "n38Audio",
    "n39Audio",
    "n40Audio",
    "n41Audio",
    "n42Audio",
    "n43Audio",
    "n44Audio",
    "n45Audio",
    "g46Audio",
    "g47Audio",
    "g48Audio",
    "g49Audio",
    "g50Audio",
    "g51Audio",
    "g52Audio",
    "g53Audio",
    "g54Audio",
    "g55Audio",
    "g56Audio",
    "g57Audio",
    "g58Audio",
    "g59Audio",
    "g60Audio",
    "o61Audio",
    "o62Audio",
    "o63Audio",
    "o64Audio",
    "o65Audio",
    "o66Audio",
    "o67Audio",
    "o68Audio",
    "o69Audio",
    "o70Audio",
    "o71Audio",
    "o72Audio",
    "o73Audio",
    "o74Audio",
    "o75Audio",
  ];

  // Load all audio files in parallel
  const audioFiles = await Promise.all(
    audioKeys.map((key) => getAudioFromIndexedDB(key))
  );

  // Check that all audio files are loaded (not null)
  const allLoaded = audioFiles.every((file) => file !== null);

 

  if (allLoaded) {
    console.log("All audio files loaded successfully.");

    return new Promise((resolve, reject) => {
      if (allLoaded) {

        resolve("Audio files are successfully loaded.");
      } else {
        reject("Audio files failed to load.");
      }
    });


  } else {
    console.warn("Some audio files are missing.");

  

    try {
      await clearDatabase(); // Ensure the database is cleared before saving new data

      const audStart =await saveAudioToIndexedDB("start", "/audios/start.mp3");
      const audStop = await saveAudioToIndexedDB("stop", "/audios/stop.mp3");
      const audBingo =await saveAudioToIndexedDB("bingo", "/audios/bingo.mp3");
      const audShuf =await saveAudioToIndexedDB("shuffle", "/audios/shuffle.mp3");

      const aud1 = await saveAudioToIndexedDB('b1Audio', '/audios/b1.mp3');
      const aud2 = await saveAudioToIndexedDB('b2Audio', '/audios/b2.mp3');
      const aud3 = await saveAudioToIndexedDB('b3Audio', '/audios/b3.mp3');
      const aud4 = await saveAudioToIndexedDB('b4Audio', '/audios/b4.mp3');
      const aud5 = await saveAudioToIndexedDB('b5Audio', '/audios/b5.mp3');
      const aud6 = await saveAudioToIndexedDB('b6Audio', '/audios/b6.mp3');
      const aud7 = await saveAudioToIndexedDB('b7Audio', '/audios/b7.mp3');
      const aud8 = await saveAudioToIndexedDB('b8Audio', '/audios/b8.mp3');
      const aud9 = await saveAudioToIndexedDB('b9Audio', '/audios/b9.mp3');
      const aud10 = await saveAudioToIndexedDB('b10Audio', '/audios/b10.mp3');
      const aud11 = await saveAudioToIndexedDB('b11Audio', '/audios/b11.mp3');
      const aud12 = await saveAudioToIndexedDB('b12Audio', '/audios/b12.mp3');
      const aud13 = await saveAudioToIndexedDB('b13Audio', '/audios/b13.mp3');
      const aud14 = await saveAudioToIndexedDB('b14Audio', '/audios/b14.mp3');
      const aud15 = await saveAudioToIndexedDB('b15Audio', '/audios/b15.mp3');


      const aud16 = await saveAudioToIndexedDB('i16Audio', '/audios/i16.mp3');
      const aud17 = await saveAudioToIndexedDB('i17Audio', '/audios/i17.mp3');
      const aud18 = await saveAudioToIndexedDB('i18Audio', '/audios/i18.mp3');
      const aud19 = await saveAudioToIndexedDB('i19Audio', '/audios/i19.mp3');
      const aud20 = await saveAudioToIndexedDB('i20Audio', '/audios/i20.mp3');
      const aud21 = await saveAudioToIndexedDB('i21Audio', '/audios/i21.mp3');
      const aud22 = await saveAudioToIndexedDB('i22Audio', '/audios/i22.mp3');
      const aud23 = await saveAudioToIndexedDB('i23Audio', '/audios/i23.mp3');
      const aud24 = await saveAudioToIndexedDB('i24Audio', '/audios/i24.mp3');
      const aud25 = await saveAudioToIndexedDB('i25Audio', '/audios/i25.mp3');
      const aud26 = await saveAudioToIndexedDB('i26Audio', '/audios/i26.mp3');
      const aud27 = await saveAudioToIndexedDB('i27Audio', '/audios/i27.mp3');
      const aud28 = await saveAudioToIndexedDB('i28Audio', '/audios/i28.mp3');
      const aud29 = await saveAudioToIndexedDB('i29Audio', '/audios/i29.mp3');
      const aud30 = await saveAudioToIndexedDB('i30Audio', '/audios/i30.mp3');


      const aud31 = await saveAudioToIndexedDB('n31Audio', '/audios/n31.mp3');
      const aud32 = await saveAudioToIndexedDB('n32Audio', '/audios/n32.mp3');
      const aud33 = await saveAudioToIndexedDB('n33Audio', '/audios/n33.mp3');
      const aud34 = await saveAudioToIndexedDB('n34Audio', '/audios/n34.mp3');
      const aud35 = await saveAudioToIndexedDB('n35Audio', '/audios/n35.mp3');
      const aud36 = await saveAudioToIndexedDB('n36Audio', '/audios/n36.mp3');
      const aud37 = await saveAudioToIndexedDB('n37Audio', '/audios/n37.mp3');
      const aud38 = await saveAudioToIndexedDB('n38Audio', '/audios/n38.mp3');
      const aud39 = await saveAudioToIndexedDB('n39Audio', '/audios/n39.mp3');
      const aud40 = await saveAudioToIndexedDB('n40Audio', '/audios/n40.mp3');
      const aud41 = await saveAudioToIndexedDB('n41Audio', '/audios/n41.mp3');
      const aud42 = await saveAudioToIndexedDB('n42Audio', '/audios/n42.mp3');
      const aud43 = await saveAudioToIndexedDB('n43Audio', '/audios/n43.mp3');
      const aud44 = await saveAudioToIndexedDB('n44Audio', '/audios/n44.mp3');
      const aud45 = await saveAudioToIndexedDB('n45Audio', '/audios/n45.mp3');

const aud46 = await saveAudioToIndexedDB('g46Audio', '/audios/g46.mp3');
  const aud47 = await saveAudioToIndexedDB('g47Audio', '/audios/g47.mp3');
  const aud48 = await saveAudioToIndexedDB('g48Audio', '/audios/g48.mp3');
  const aud49 = await saveAudioToIndexedDB('g49Audio', '/audios/g49.mp3');
  const aud50 = await saveAudioToIndexedDB('g50Audio', '/audios/g50.mp3');
  const aud51 = await saveAudioToIndexedDB('g51Audio', '/audios/g51.mp3');
  const aud52 = await saveAudioToIndexedDB('g52Audio', '/audios/g52.mp3');
  const aud53 = await saveAudioToIndexedDB('g53Audio', '/audios/g53.mp3');
  const aud54 = await saveAudioToIndexedDB('g54Audio', '/audios/g54.mp3');
  const aud55 = await saveAudioToIndexedDB('g55Audio', '/audios/g55.mp3');
  const aud56 = await saveAudioToIndexedDB('g56Audio', '/audios/g56.mp3');
  const aud57 = await saveAudioToIndexedDB('g57Audio', '/audios/g57.mp3');
  const aud58 = await saveAudioToIndexedDB('g58Audio', '/audios/g58.mp3');
  const aud59 = await saveAudioToIndexedDB('g59Audio', '/audios/g59.mp3');
  const aud60 = await saveAudioToIndexedDB('g60Audio', '/audios/g60.mp3');

  const aud61 = await saveAudioToIndexedDB('o61Audio', '/audios/o61.mp3');
    const aud62 = await saveAudioToIndexedDB('o62Audio', '/audios/o62.mp3');
    const aud63 = await saveAudioToIndexedDB('o63Audio', '/audios/o63.mp3');
    const aud64 = await saveAudioToIndexedDB('o64Audio', '/audios/o64.mp3');
    const aud65 = await saveAudioToIndexedDB('o65Audio', '/audios/o65.mp3');
    const aud66 = await saveAudioToIndexedDB('o66Audio', '/audios/o66.mp3');
    const aud67 = await saveAudioToIndexedDB('o67Audio', '/audios/o67.mp3');
    const aud68 = await saveAudioToIndexedDB('o68Audio', '/audios/o68.mp3');
    const aud69 = await saveAudioToIndexedDB('o69Audio', '/audios/o69.mp3');
    const aud70 = await saveAudioToIndexedDB('o70Audio', '/audios/o70.mp3');
    const aud71 = await saveAudioToIndexedDB('o71Audio', '/audios/o71.mp3');
    const aud72 = await saveAudioToIndexedDB('o72Audio', '/audios/o72.mp3');
    const aud73 = await saveAudioToIndexedDB('o73Audio', '/audios/o73.mp3');
    const aud74 = await saveAudioToIndexedDB('o74Audio', '/audios/o74.mp3');
    const aud75 = await saveAudioToIndexedDB('o75Audio', '/audios/o75.mp3');

      return new Promise((resolve, reject) => {
   
    
        
        if (
          audStart &&
          audStop &&
          audShuf &&
          audBingo &&
          aud1 &&
          aud2 &&
          aud3 &&
          aud4 &&
          aud5 &&
          aud6 &&
          aud7 &&
          aud8 &&
          aud9 &&
          aud10 &&
          aud11 &&
          aud12 &&
          aud13 &&
          aud14 &&
          aud15 &&
          aud16 &&
          aud17 &&
          aud18 &&
          aud19 &&
          aud20 &&
          aud21 &&
          aud22 &&
          aud23 &&
          aud24 &&
          aud25 &&
          aud26 &&
          aud27 &&
          aud28 &&
          aud29 &&
          aud30 &&
          aud31 &&
          aud32 &&
          aud33 &&
          aud34 &&
          aud35 &&
          aud36 &&
          aud37 &&
          aud38 &&
          aud39 &&
          aud40 &&
          aud41 &&
          aud42 &&
          aud43 &&
          aud44 &&
          aud45 &&
          aud46 &&
          aud47 &&
          aud48 &&
          aud49 &&
          aud50 &&
          aud51 &&
          aud52 &&
          aud53 &&
          aud54 &&
          aud55 &&
          aud56 &&
          aud57 &&
          aud58 &&
          aud59 &&
          aud60 &&
          aud61 &&
          aud62 &&
          aud63 &&
          aud64 &&
          aud65 &&
          aud66 &&
          aud67 &&
          aud68 &&
          aud69 &&
          aud70 &&
          aud71 &&
          aud72 &&
          aud73 &&
          aud74 &&
          aud75 ) {
          resolve("Audio files are successfully loaded.");
        } else {
          reject("Audio files failed to load.");
        }
      });


      
    } catch (error) {
      console.error("Error retrieving audio file again:", error);
      return false
    }
  }
};
