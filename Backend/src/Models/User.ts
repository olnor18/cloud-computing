import { Guid } from 'guid-typescript';
import ExperimentReport from './ExperimentReport';
import Savable from './../Common/Savable.interface';
import DeserializationError from '../Errors/DeserializationError';

export default class User implements Savable {
  private _id: string;
  private experimentReports: ExperimentReport[];

  constructor(experimentReports?: ExperimentReport[], id?: string) {
    this.experimentReports = experimentReports ? experimentReports : [];
    this._id = id ? id : Guid.create().toString().toString();
  }

  public getId(): string {
    return this._id;
  }

  public getExperimentReports(): ExperimentReport[] { 
    return this.experimentReports;
  }

  public addExperimentReport(experimentReport: ExperimentReport): void {
    this.experimentReports.push(experimentReport);
  }

  public serialize() {
    return {
      _id: this._id,
      experimentReports: this.experimentReports.map(er => er.serialize())
    };
  }

  public static deserialize(queryResult: any): User {
    if (
      queryResult && 
      queryResult._id
    ) { 
      let experimentReports: ExperimentReport[] = [];

      if (queryResult.experimentReports[0]) {
        experimentReports = queryResult.experimentReports.map(
          (subqueryResult: any) => ExperimentReport.deserialize(subqueryResult)
        )
      } 

      return new User(
        experimentReports,
        queryResult._id,
      );
    }

    throw new DeserializationError("The provided query result is not a valid user.");
  }
}
