type ExperimentTypes = "No Adaption" | "Sequential" | "Reinforcement Learning" | "Rule-based" | "Unknown";

export class ExperimentCounterService {
  
  public static getExperimentCount(): number {
    const currentCount =  localStorage.getItem('experimentCount');

    if (currentCount) {
      return parseInt(currentCount);
    }

    return 0;
  }

  public static getExperimentName() {
    const currentCount = localStorage.getItem('experimentCount');

    if (currentCount) {
      switch (parseInt(currentCount)) {
        case 0:
          return 'Reinforcement Learning 1';
        case 1:
          return 'No Adaption';
        case 2:
          return 'Reinforcement Learning 2';
        case 3:
          return 'Sequential';
        case 4:
          return 'Reinforcement Learning 3';
        case 5:
          return 'Rule-based';
        case 6:
          return 'Reinforcement Learning 4';
      }
    }

    return 'Unknown';
  }

  public static getExperimentType(): ExperimentTypes {
    const currentCount = localStorage.getItem('experimentCount');

    if (currentCount) {
      switch (parseInt(currentCount)) {
        case 0:
          return "Reinforcement Learning"
        case 1:
          return "No Adaption";
        case 2:
          return "Reinforcement Learning";
        case 3:
          return "Sequential";
        case 4:
          return "Reinforcement Learning";
        case 5:
          return "Rule-based";
        case 6:
          return "Reinforcement Learning";
      }
    }

    return "Unknown";
  }

  public static reset() {
    localStorage.setItem('experimentCount', (0).toString());
  }

  public static incrementExperimentCount(): void {
    const currentCount = this.getExperimentCount();
    localStorage.setItem('experimentCount', (currentCount + 1).toString());
  }
}