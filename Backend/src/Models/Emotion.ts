import DeserializationError from '../Errors/DeserializationError';

export default class Emotion { 
  private emotionName: string;
  private intensity: number;

  constructor(emotionName: string, intensity: number) {
    this.emotionName = emotionName;
    this.intensity = intensity;
  }

  public getEmotionName(): string {
    return this.emotionName;
  }

  public getIntensity(): number {
    return this.intensity;
  }

  public serialize() {
    return {
      emotionName: this.emotionName,
      intensity: this.intensity
    };
  }

  public static deserialize(queryResult: any): Emotion {
    if (
      queryResult && 
      queryResult.emotionName &&
      queryResult.intensity
    ) { 
      return new Emotion(
        queryResult.emotionName,
        queryResult.intensity,
      );
    }

    throw new DeserializationError("The provided query result is not a valid emotion.");
  }
}
