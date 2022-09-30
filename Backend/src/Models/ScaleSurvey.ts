import { Guid } from "guid-typescript";
import Savable from './../Common/Savable.interface';

export default class ScaleSurvey implements Savable {
  private _id: string;
  private answers: number[];
  private userId: string;
  private experimentNumber: number;

  constructor(answers: number[], userId: string, experimentNumber: number, id?: string) {
    this.answers = answers;
    this.userId = userId;
    this.experimentNumber = experimentNumber;
    this._id = id ? id : Guid.create().toString().toString();
  }

  public getId(): string {
    return this._id;
  }

  public getAnswers(): number[] {
    return this.answers;
  }

  public getExperimentNumber(): number {
    return this.experimentNumber;
  }

  public serialize(): { [key: string]: any; } {
    return {
      _id: this._id,
      answers: this.answers,
      userId: this.userId,
      experimentNumber: this.experimentNumber,
    };
  }

  public static deserialize(queryResult: any): ScaleSurvey {
    if (
      queryResult && 
      queryResult._id &&
      queryResult.answers &&
      queryResult.userId &&
      queryResult.experimentNumber
    ) { 
      return new ScaleSurvey(
        queryResult.answers,
        queryResult.userId,
        queryResult.experimentNumber,
        queryResult._id,
      );
    }

    throw new Error("The provided query result is not a valid text survey.");
  }
}
