export class AdaptionRecorder {
  private static adaptions: { 
    adaptionName: string,
    timestamp: number
  }[] = [];

  public static addAdaption(adaption: { 
    adaptionName: string,
    timestamp: number
  }) {
    this.adaptions.push(adaption);
  }

  public static getAdaptions() {
    return this.adaptions;
  }

  public static clearAdaptions() {
    this.adaptions = [];
  }
}
