import { TextToSpeechClient } from '@google-cloud/text-to-speech';


export async function textToSpeech(text, documentType) {
  try {
    // Create a client
    const client = new TextToSpeechClient();
    
    // Google TTS has a limit of 5000 characters per request
    // Split text into chunks if needed
    const MAX_CHARS = 5000;
    const textChunks = [];
    
    for (let i = 0; i < text.length; i += MAX_CHARS) {
      textChunks.push(text.substring(i, i + MAX_CHARS));
    }
    
    console.log(`Split text into ${textChunks.length} chunks for processing`);
    
    // Process each chunk and combine the audio
    let allAudioContent = Buffer.alloc(0);
    
    let speakingRate = 1.0;
    let pitch = 0.0;
    let periodPause = "500ms";
    let commaPause = "250ms";
    let ssmlGender = "NEUTRAL"; // Corrected case to match Google TTS API requirements
    
    switch (documentType.trim()) {  // Trim to remove any accidental spaces
      case "Formal":
        speakingRate = 0.9;
        periodPause = "600ms";
        commaPause = "300ms";
        break;
      case "Instructions":
        speakingRate = 1.1;
        pitch = 0.2;
        periodPause = "800ms";
        commaPause = "200ms";
        break;
      case "Creative":
        speakingRate = 1.0;
        pitch = -0.1;
        periodPause = "700ms";
        commaPause = "400ms";
        ssmlGender = "MALE";
        break;
      case "Informational":
        speakingRate = 1.05;
        pitch = 0.05;
        periodPause = "500ms";
        commaPause = "250ms";
        break;
      case "Academic":
        speakingRate = 0.95;
        pitch = 0.1;
        periodPause = "650ms";
        commaPause = "350ms";
        break;
      case "Personal":
        speakingRate = 1.05;
        pitch = 0.15;
        periodPause = "450ms";
        commaPause = "200ms";
        break;
      case "Technical":
        speakingRate = 0.9;
        pitch = -0.1;
        periodPause = "700ms";
        commaPause = "400ms";
        break;
      case "Financial":
        speakingRate = 0.9;
        pitch = 0.0;
        periodPause = "600ms";
        commaPause = "300ms";
        break;
      default:
        console.warn(`Unknown documentType: "${documentType}"`); // Log unexpected values
        break;
    }
    
    console.log(`Using documentType: ${documentType}, periodPause: ${periodPause}`);
    
    for (let i = 0; i < textChunks.length; i++) {
      // Fixed: declare ssmlText with let/const
      let ssmlText = textChunks[i]
        .replace(/\./g, `<break time="${periodPause}"/>.`)
        .replace(/,/g, `<break time="${commaPause}"/>,`);
      
      const request = {
        input: { ssml: `<speak>${ssmlText}</speak>` },
        voice: {
          languageCode: "en-US",
          ssmlGender: ssmlGender, // Use the corrected variable
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: speakingRate,
          pitch: pitch,
        },
      };
      
      const [response] = await client.synthesizeSpeech(request);
      allAudioContent = Buffer.concat([allAudioContent, Buffer.from(response.audioContent)]);
    }
    
    return allAudioContent;
  } catch (error) {
    console.error('Error in text-to-speech conversion:', error);
    throw error;
  }
}














































 // for (let i = 0; i < textChunks.length; i++) {
    //   console.log(`Processing chunk ${i+1}/${textChunks.length}...`);
      
    //   // Construct the request for this chunk
    //   const request = {
    //     input: { text: textChunks[i] },
    //     voice: { 
    //       languageCode:'en-US', 
    //       ssmlGender:'NEUTRAL' 
    //     },
    //     audioConfig: { 
    //       audioEncoding:'MP3',
    //       speakingRate: 1.0,
    //       pitch:0.0
    //     },
    //   };
      
      // Generate speech for this chunk
      
      
      // Combine with previous audio
      
    