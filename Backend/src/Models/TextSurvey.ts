import { Guid } from "guid-typescript";
import Savable from './../Common/Savable.interface';

export default class TextSurvey implements Savable {
  private _id: string;
  private answers: string[];
  private userId: string;

  constructor(answers: string[], userId: string, id?: string) {
    this.answers = answers;
    this.userId = userId;
    this._id = id ? id : Guid.create().toString().toString();
  }

  public getId(): string {
    return this._id;
  }

  public getAnswers(): string[] {
    return this.answers;
  }

  public serialize(): { [key: string]: any; } {
    return {
      _id: this._id,
      answers: this.answers,
      userId: this.userId
    };
  }

  public static deserialize(queryResult: any): TextSurvey {
    if (
      queryResult && 
      queryResult._id &&
      queryResult.answers &&
      queryResult.userId
    ) { 
      return new TextSurvey(
        queryResult.answers,
        queryResult.userId,
        queryResult._id,
      );
    }

    throw new Error("The provided query result is not a valid text survey.");
  }
}
