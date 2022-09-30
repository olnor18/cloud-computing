import DeserializationError from "../Errors/DeserializationError";

export default class Adaption {
  private adaptionName: string;
  private timestamp: Date;

  constructor(adaptionName: string, timestamp: Date) {
    this.adaptionName = adaptionName;
    this.timestamp = timestamp;
  }

  public getAdaptionName(): string {
    return this.adaptionName;
  }

  public getTimestamp(): Date {
    return this.timestamp;
  }

  public serialize() {
    return {
      adaptionName: this.adaptionName,
      timestamp: +this.timestamp
    };
  }

  public static deserialize(queryResult: any): Adaption {
    if (
      queryResult && 
      queryResult.adaptionName &&
      queryResult.timestamp
    ) { 
      return new Adaption(
        queryResult.adaptionName,
        new Date(queryResult.timestamp),
      );
    }

    throw new DeserializationError("The provided query result is not a valid adaption.");
  }
}
