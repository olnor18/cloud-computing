import Adaption from "./Adaption";
import EmotionSnapshot from "./EmotionSnapshot";
import DeserializationError from "../Errors/DeserializationError";
import TaskCompletionStatus from './TaskCompletionStatus';

export type ExperimentTypes = "No Adaption" | "Sequential" | "Reinforcement Learning" | "Rule-based" | "Unknown";

export default class ExperimentReport {
  private experimentNumber: number;
  private emotionSnapshots: EmotionSnapshot[];
  private adaptions: Adaption[];
  private experimentName: string;
  private experimentType: ExperimentTypes;
  private experimentStarted: number;
  private experimentEnded: number | undefined;
  private taskCompletionStatus: TaskCompletionStatus | undefined;
  
  constructor(
    experimentNumber: number,
    experimentName: string,
    experimentType: ExperimentTypes, 
    experimentStarted: number,
    experimentEnded?: number,
    emotionSnapshots?: EmotionSnapshot[], 
    adaptions?: Adaption[],
    taskCompletionStatus?: TaskCompletionStatus
  ) {
    this.experimentNumber = experimentNumber;
    this.experimentName = experimentName;
    this.experimentType = experimentType;
    this.experimentStarted = experimentStarted;
    this.experimentEnded = experimentEnded;
    this.emotionSnapshots = emotionSnapshots ? emotionSnapshots : [];
    this.adaptions = adaptions ? adaptions : [];
    this.taskCompletionStatus = taskCompletionStatus;
  }

  public getExperimentNumber(): number {
    return this.experimentNumber;
  }

  public getExperimentName(): string {
    return this.experimentName;
  }

  public getExperimentType(): ExperimentTypes {
    return this.experimentType;
  }

  public getEmotionSnapshots(): EmotionSnapshot[] {
    return this.emotionSnapshots;
  }

  public getAdaptions(): Adaption[] {
    return this.adaptions;
  }

  public getTaskCompletionStatus(): TaskCompletionStatus | undefined {
    return this.taskCompletionStatus;
  }

  public getExperimentStarted(): number {
    return this.experimentStarted;
  }

  public getExperimentEnded(): number | undefined {
    return this.experimentEnded;
  }

  public setExperimentStarted(experimentStarted: number): void {
    this.experimentStarted = experimentStarted;
  }

  public setExperimentEnded(experimentEnded: number): void {
    this.experimentEnded = experimentEnded;
  }

  public setTaskCompletionStatus(taskCompletionStatus: TaskCompletionStatus): void {
    this.taskCompletionStatus = taskCompletionStatus;
  }

  public addEmotionSnapshot(emotionSnapshot: EmotionSnapshot): void {
    this.emotionSnapshots.push(emotionSnapshot);
  }

  public addAdaption(adaption: Adaption): void {
    this.adaptions.push(adaption);
  }

  public serialize() {
    return {
      experimentNumber: this.experimentNumber,
      experimentName: this.experimentName,
      experimentType: this.experimentType,
      emotionSnapshots: this.emotionSnapshots.map(es => es.serialize()),
      adaptions: this.adaptions.map(a => a.serialize()),
      experimentStarted: this.experimentStarted,
      experimentEnded: this.experimentEnded,
      taskCompletionStatus: this.taskCompletionStatus
    };
  }

  public static deserialize(queryResult: any): ExperimentReport {
    if (
      queryResult && 
      queryResult.experimentNumber &&
      queryResult.experimentName &&
      queryResult.experimentType &&
      queryResult.experimentStarted
    ) { 
      let emotionSnapshots: EmotionSnapshot[] = [];
      let adaptions: Adaption[] = [];

      if (queryResult.emotionSnapshots) {
        emotionSnapshots = queryResult.emotionSnapshots.map(
          (subqueryResult: any) => EmotionSnapshot.deserialize(subqueryResult)
        )
      }

      if (queryResult.adaptions) {
        adaptions = queryResult.adaptions.map(
          (subqueryResult: any) => Adaption.deserialize(subqueryResult)
        )
      }

      return new ExperimentReport(
        queryResult.experimentNumber,
        queryResult.experimentName,
        queryResult.experimentType,
        queryResult.experimentStarted,
        queryResult.experimentEnded,
        emotionSnapshots,
        adaptions,
        TaskCompletionStatus.deserialize(queryResult.taskCompletionStatus)
      );
    }

    throw new DeserializationError("The provided query result is not a valid experiment report.");
  }
}
