import { Guid } from "guid-typescript";
import Savable from "../Common/Savable.interface";
import DeserializationError from "../Errors/DeserializationError";

export default class ExperimentTimestamps implements Savable { 
  private _id: string;
  private startTime: number;
  private endTime: number;
  private userId: string;
  private experimentReportNumber: number;

  constructor(startTime: number, endTime: number, userId: string, experimentReportNumber: number, id?: string) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.userId = userId;
    this.experimentReportNumber = experimentReportNumber;
    this._id = id ? id : Guid.create().toString().toString();
  }

  public getId(): string {
    return this._id;
  }

  public getStartTime(): number {
      return this.startTime;
  }

  public getEndTime(): number {
      return this.endTime;
  }

  public getUserId(): string {
      return this.userId
  }

  public getExperimentReportNumber(): number {
      return this.experimentReportNumber
  }

  public serialize() {
    return {
      _id: this._id,
      startTime: this.startTime,
      endTime: this.endTime,
      userId: this.userId,
      experimentReportNumber: this.experimentReportNumber
    };
  }

  public static deserialize(queryResult: any): ExperimentTimestamps {
    if (
      queryResult && 
      queryResult._id,
      queryResult.userId,
      queryResult.experimentReportNumber
    ) { 
      return new ExperimentTimestamps(
        queryResult.startTime,
        queryResult.endTime,
        queryResult.userId,
        queryResult.experimentReportNumber,
        queryResult._id
      );
    }

    throw new DeserializationError("The provided query result is not a valid ExperimentTimestamps.");
  }
}
