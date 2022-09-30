import { Adaptions } from "../common/Enums"
import { EmotionSnapshot } from "../common/Types";
import { TelemetryService } from "../services/TelemetryService";

enum EmotionCategory {
  POSITIVE,
  NEGATIVE
}

type EmotionType = "surprise" | "disgust" | "sadness" | "anger" | "happiness" | "fear";

export class RuleBasedAgent {
  private inputEmotions: number[] = [];
  private emotionSnapshots: EmotionSnapshot[] = [];
  private lastEmotionCategory: EmotionCategory = EmotionCategory.POSITIVE;
  private intervalTimer: NodeJS.Timer | undefined;

  public run = (callback: (adaption: Adaptions) => void) => {
    TelemetryService.getInstance().reset();
    this.updateIntervalDuration(callback);
  }

  public stop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }
  }

  private evaluateRules(callback: (adaption: Adaptions) => void) {
    TelemetryService.getInstance().startRecording("Rule-based");
    if (!callback) {
      console.log("No rule based callback defined!"); 
      return;
    }

    // Surprise less than disgust OR surprise less than sadness
    if (
      this.getAverageEmotionIntensity("surprise") < this.getAverageEmotionIntensity("disgust") ||
      this.getAverageEmotionIntensity("surprise") < this.getAverageEmotionIntensity("sadness")
    ) {
      callback(Adaptions.CHANGE_DIALOG_VISIBILITY);
      this.lastEmotionCategory = EmotionCategory.NEGATIVE;
    }

    // Happiness is less than disgust OR happiness is less than sadness OR happiness is less than anger
    if (
      this.getAverageEmotionIntensity("happiness") < this.getAverageEmotionIntensity("disgust") ||
      this.getAverageEmotionIntensity("happiness") < this.getAverageEmotionIntensity("sadness") ||
      this.getAverageEmotionIntensity("happiness") < this.getAverageEmotionIntensity("anger")
    ) {
      callback(Adaptions.CHANGE_FONT_SIZE);
      this.lastEmotionCategory = EmotionCategory.NEGATIVE;
    }

    // Happiness is greater than surprise
    if (
      this.getAverageEmotionIntensity("happiness") > this.getAverageEmotionIntensity("surprise")
    ) {
       callback(Adaptions.CHANGE_COLOR_THEME);
      this.lastEmotionCategory = EmotionCategory.POSITIVE;
    }

    // Fear is less than 0.08 OR disgust is greater than 0.01
    if (
      this.getAverageEmotionIntensity("fear") < 0.08 ||
      this.getAverageEmotionIntensity("disgust") > 0.01
    ) {
      callback(Adaptions.CHANGE_MAP_TYPE);
      this.lastEmotionCategory = EmotionCategory.NEGATIVE;
    }

    this.emotionSnapshots = [];
    this.inputEmotions = [];

    TelemetryService.getInstance().stopRecording();
    this.updateIntervalDuration(callback);
  }

  private countEmotionOccurence = (emotion: number) => {
    return this.inputEmotions.filter((e) => e === emotion).length;
  }

  private getAverageEmotionIntensity = (targetEmotion: EmotionType) => {
    const emotionValues = this.emotionSnapshots.map((e) => e[targetEmotion]);
    return emotionValues.reduce((a, b) => a + b, 0) / emotionValues.length;
  }

  private updateIntervalDuration(callback: (adaption: Adaptions) => void) {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }

    this.intervalTimer = setInterval(() => this.evaluateRules(callback),
      this.lastEmotionCategory === EmotionCategory.POSITIVE ? 1000 * 15 : 1000 * 20
    );
  }

  public addInputEmotion = (emotion: number) => {
    this.inputEmotions.push(emotion);
  }

  public addInputEmotions = (emotions: EmotionSnapshot) => {
    this.emotionSnapshots.push(emotions);
  }
}
