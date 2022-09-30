export default class TaskCompletionStatus{ 
  private distanceToDestination: number | string;
  private taskCompleted: boolean;

  constructor(distanceToDestination: number | string, taskCompleted: boolean, id?: string) {
    this.distanceToDestination = distanceToDestination;
    this.taskCompleted = taskCompleted;
  }

  public getDistanceToDestination(): number | string {
    return this.distanceToDestination
  }

  public getTaskCompleted(): boolean {
      return this.taskCompleted
  }

  public serialize() {
    return {
      distanceToDestination: this.distanceToDestination,
      taskCompleted: this.taskCompleted,
    };
  }

  public static deserialize(queryResult: any): TaskCompletionStatus | undefined {
    if (
      queryResult
    ) { 
      return new TaskCompletionStatus(
        (queryResult.distanceToDestination !== null && queryResult.distanceToDestination !== undefined) ? queryResult.distanceToDestination : "Not registered",
        (queryResult.taskCompleted !== null && queryResult.taskCompleted !== undefined) ? queryResult.taskCompleted : false,
      );
    }

    return undefined;
  }
}
