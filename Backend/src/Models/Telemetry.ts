import { Guid } from "guid-typescript";
import Savable from './../Common/Savable.interface';

export default class Telemetry implements Savable {
  private _id: string;
  private name: string;
  private duration: number;

  constructor(name: string, duration: number, id?: string) {
    this.name = name;
    this.duration = duration;
    this._id = id ? id : Guid.create().toString().toString();
  }

  public getId(): string {
    return this._id;
  }

  public getName(): string {
    return this.name;
  }

  public getDuration(): number {
    return this.duration;
  }

  public serialize(): { [key: string]: any; } {
    return {
      _id: this._id,
      name: this.name,
      duration: this.duration,
    };
  }

  public static deserialize(queryResult: any): Telemetry {
    if (
      queryResult && 
      queryResult._id &&
      queryResult.name &&
      queryResult.duration
    ) { 
      return new Telemetry(
        queryResult.answers,
        queryResult.name,
        queryResult.duration,
      );
    }

    throw new Error("The provided query result is not a valid Telemetry object");
  }
}
