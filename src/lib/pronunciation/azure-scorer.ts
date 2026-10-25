/**
 * Implémentation Azure Speech Services du scorer de prononciation.
 *
 * CONFIGURATION REQUISE :
 * - PRONUNCIATION_SCORER=azure
 * - AZURE_SPEECH_KEY=<votre clé Azure Speech>
 * - AZURE_SPEECH_REGION=<région, ex: westeurope>
 *
 * INSTALLATION du SDK Azure :
 *   npm install microsoft-cognitiveservices-speech-sdk
 *
 * FONCTIONNALITÉS :
 * - Score d'exactitude phonémique (AccuracyScore)
 * - Score de fluidité (FluencyScore)
 * - Score de complétude (CompletenessScore)
 * - Analyse au niveau du phonème
 * - Granularité : mot, syllabe, phonème
 *
 * Documentation : https://docs.microsoft.com/azure/cognitive-services/speech-service/pronunciation-assessment-tool
 */

import type { PronunciationScorer } from "./types";
import type { PronunciationScore } from "@/types";

function checkAzureConfig(): { key: string; region: string } | null {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return null;
  return { key, region };
}

export const azurePronunciationScorer: PronunciationScorer = {
  async score(
    audioBase64: string,
    referenceText: string,
    _mimeType: string
  ): Promise<PronunciationScore> {
    const config = checkAzureConfig();
    if (!config) {
      return {
        issues: [],
        warning:
          "Azure Speech non configuré. Définissez AZURE_SPEECH_KEY et AZURE_SPEECH_REGION.",
      };
    }

    try {
      // Import dynamique pour éviter l'erreur si le SDK n'est pas installé
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const moduleName = "microsoft-cognitiveservices-speech-sdk";
      const sdk = require(moduleName);

      const speechConfig = sdk.SpeechConfig.fromSubscription(
        config.key,
        config.region
      );
      speechConfig.speechRecognitionLanguage = "en-US";

      // Configuration de l'évaluation de prononciation
      const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
        referenceText,
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Phoneme,
        true // enableMiscue
      );

      // Convertir base64 -> ArrayBuffer -> AudioConfig
      const audioBuffer = Buffer.from(audioBase64, "base64");
      const audioConfig = sdk.AudioConfig.fromWavFileInput(
        // Azure attend du PCM/WAV ; si l'audio est WebM, une conversion est nécessaire
        // Ici on passe le buffer directement (fonctionne avec WAV)
        audioBuffer
      );

      return new Promise((resolve) => {
        const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
        pronunciationConfig.applyTo(recognizer);

        recognizer.recognizeOnceAsync(
          (result: any) => {
            recognizer.close();

            if (result.reason !== sdk.ResultReason.RecognizedSpeech) {
              resolve({
                issues: [],
                warning: "Azure Speech n'a pas pu analyser l'audio.",
              });
              return;
            }

            const assessment = sdk.PronunciationAssessmentResult.fromResult(result);
            const issues: PronunciationScore["issues"] = [];

            // Analyse des mots avec un score bas
            for (const word of assessment.detailResult?.Words ?? []) {
              if (word.PronunciationAssessment?.AccuracyScore < 70) {
                issues.push({
                  word: word.Word,
                  suggestion: `Précision: ${word.PronunciationAssessment.AccuracyScore}/100`,
                  confidence: word.PronunciationAssessment.AccuracyScore < 40
                    ? "high"
                    : "medium",
                });
              }
            }

            resolve({
              accuracyScore: assessment.accuracyScore,
              fluencyScore: assessment.fluencyScore,
              completenessScore: assessment.completenessScore,
              issues,
            });
          },
          (err: Error) => {
            recognizer.close();
            console.error("[azure-scorer]", err);
            resolve({
              issues: [],
              warning: `Erreur Azure Speech : ${err.message}`,
            });
          }
        );
      });
    } catch (err) {
      console.error("[azure-scorer] SDK non disponible:", err);
      return {
        issues: [],
        warning:
          "SDK Azure Speech non installé. Exécutez : npm install microsoft-cognitiveservices-speech-sdk",
      };
    }
  },
};
