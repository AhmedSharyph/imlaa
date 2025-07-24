import axios from "axios";
import fs from "fs-extra";
import dotenv from "dotenv";

dotenv.config();

const baseUrl = "https://api.assemblyai.com";
const apiKey = process.env.ASSEMBLYAI_API_KEY;

if (!apiKey) {
  console.error("❌ Error: ASSEMBLYAI_API_KEY not found in environment variables.");
  process.exit(1);
}

const headers = {
  authorization: apiKey,
};

// Option 2: Use a remote audio URL (example)
const audioUrl = "https://storage.googleapis.com/aai-web-samples/espn-bear.mp3";

async function startTranscription() {
  const requestPayload = {
    audio_url: audioUrl,
    speech_model: "universal",
    language_code: "dv"  // Divehi language code - test if supported
  };

  try {
    const response = await axios.post(`${baseUrl}/v2/transcript`, requestPayload, { headers });
    const transcriptId = response.data.id;
    console.log("Transcription started, ID:", transcriptId);

    const pollingEndpoint = `${baseUrl}/v2/transcript/${transcriptId}`;
    while (true) {
      const pollingResponse = await axios.get(pollingEndpoint, { headers });
      const status = pollingResponse.data.status;

      if (status === "completed") {
        console.log("\n✅ Transcription Complete:\n");
        console.log(pollingResponse.data.text);
        break;
      } else if (status === "error") {
        console.error("❌ Transcription failed:", pollingResponse.data.error);
        break;
      } else {
        process.stdout.write(".");
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  } catch (error) {
    console.error("❌ Error during transcription:", error.message);
  }
}

startTranscription();
