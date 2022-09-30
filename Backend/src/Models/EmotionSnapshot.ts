import Emotion from "./Emotion";
import DeserializationError from "../Errors/DeserializationError";

export default class EmotionSnapshot { 
  private emotions: Emotion[];
  private timesliceStart: Date;
  private timesliceEnd: Date;

  constructor(emotions: Emotion[], timesliceStart: Date, timesliceEnd: Date) {
    this.emotions = emotions;
    this.timesliceStart = timesliceStart;
    this.timesliceEnd = timesliceEnd;
  }

  public getEmotions(): Emotion[] {
    return this.emotions;
  }

  public getTimesliceStart(): Date {
    return this.timesliceStart;
  }

  public getTimesliceEnd(): Date {
    return this.timesliceEnd;
  }

  public addEmotion(emotion: Emotion): void {
    this.emotions.push(emotion);
  }

  public serialize() {
    return {
      emotions: this.emotions.map(emotion => emotion.serialize()),
      timesliceStart: +this.timesliceStart,
      timesliceEnd: +this.timesliceEnd
    };
  }

  public static deserialize(queryResult: any): EmotionSnapshot {
    if (
      queryResult && 
      queryResult.emotions &&
      queryResult.timesliceStart &&
      queryResult.timesliceEnd 
    ) { 
      return new EmotionSnapshot(
        queryResult.emotions.map((emotion: any) => Emotion.deserialize(emotion)),
        new Date(queryResult.timesliceStart),
        new Date(queryResult.timesliceEnd)
      );
    }

    throw new DeserializationError("The provided query result is not a valid emotion snapshot.");
  }
}
