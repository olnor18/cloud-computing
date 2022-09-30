import { EmotionalState } from "./EmotionalState";
import { UIElement } from "./UIElement";
import { configObject } from "./config";
import { ColorThemes, DialogVisibility, Emotion, MapType } from "../common/Enums";
import { TelemetryService } from './../services/TelemetryService';

export enum Actions {
  FontSizeMedium,
  FontSizeLarge,
  ColorThemeLight,
  ColorThemeDark,
  DestinationA,
  DestinationB,
  MapTypeTerrain,
  MapTypeSatellite,
  DialogVisible,
  DialogHidden,
  DoNothing
}

export class RLAgent {
  private emotionalState:EmotionalState = new EmotionalState();
  private UIElements:UIElement[] = [];
  private gamma:number;
  private alpha:number;
  private epsilon:number;
  private qTable:any[] = [];
  private rewardTable:any[] = [];
  private actions:string[] = []
  private rewardSum:number = 0;
  private intervalID:(NodeJS.Timer|undefined);
  private inputEmotions:number[] = []
  private action_index:number;

  constructor(uiElements: UIElement[]) {
    this.alpha = configObject.alpha;
    this.gamma = configObject.gamma;
    this.epsilon = configObject.epsilon;
    //Initialize action index, will change in run() when used
    this.action_index = 999;
    this.UIElements = uiElements;

    TelemetryService.getInstance().reset();

    this.setupAgent()
  }
    
  private getUIElement = (element:number) => {
    return this.UIElements[element];
  }
  private getUIElements = ():UIElement[] => {
    return this.UIElements;
  }
  private getEmotionalState = ():EmotionalState => {
    return this.emotionalState;
  }
  private setRewardsTable = (rewardsArr:any[]) => {
    this.rewardTable = rewardsArr;
  }
  public setQ_Values = (qtable:any[]) => {
    this.qTable = qtable;
  }
  public getQ_values = ():any[] => {
    return this.qTable;
  }
  private setActions = (actions:string[]) => {
    this.actions = actions;
  }
  private setRewardSum = (reward:number) => {
    this.rewardSum += reward;
  }
  private getRewardSum = ():number => {
    return this.rewardSum;
  }
  public getEmotion = () => {
    return this.emotionalState
  }
  public addInputEmotion = (emotion:number) => {
    this.inputEmotions.push(emotion)
  }
  private getStateSpace = ():number[] => {
    let stateSpaceArr = []

    for (const element of this.getUIElements()) {
      stateSpaceArr.push(element.getState())
    }
    stateSpaceArr.push(this.getEmotionalState().getCurrentEmotion())
    return stateSpaceArr;
  }

  private delay = (ms:number) => new Promise(res => setTimeout(res, ms));

  private FindValueOfCurrentState = (currentLayer: any[], depth: number):[] => {
    if (depth <= this.UIElements.length - 1) {
      return this.FindValueOfCurrentState(currentLayer[this.getUIElement(depth).getState()], depth + 1);       
    } else {
      return currentLayer[this.getEmotionalState().getCurrentEmotion()];
    }
  }

  private is_terminal_state = () => {
    if(this.getRewardSum() === 1000){
      return true
    } else {
      return false
    }
  }

  private get_starting_state = () => {
    let emotion = this.getEmotionalState();
    const setElementStates = () => {
      for (let i = 0; i < this.UIElements.length; i++) {
        this.UIElements[i].setState(Math.floor(Math.random() * this.UIElements[i].getState_Count()));
      }
    }

    // choose a random non-terminal state for the elements
    setElementStates();
    emotion.setCurrentEmotionalState(Math.floor(Math.random() * emotion.getAvailableState_Count()))

    // if terminal find new state
    while(this.is_terminal_state()) {
      setElementStates();
      emotion.setCurrentEmotionalState(Math.floor(Math.random() * emotion.getAvailableState_Count()))
    }
  }

  private update_user_emotion = async () => {

    const mostOccuringEmotion = (arr:number[]) => {
      return arr.sort((a,b) => 
        arr.filter(v => v===a).length
        - arr.filter(v => v===b).length
      ).pop()
    }

    let emotion = mostOccuringEmotion(this.inputEmotions)
    if(emotion !== undefined && emotion >= 0){
      this.getEmotionalState().setCurrentEmotionalState(emotion)
    }
    this.inputEmotions = []
  }

  private get_next_action = (epsilon:number):number => {
    //Exploration vs explotation, the rate of exploration is decided by epsilon (0.9 epsilon = 10% exploration)
    let random = Math.random()
    if(random < epsilon){
      
      //Getting action array for specific state, choosing the index of action with highest value
      let index_of_best_action = this.FindValueOfCurrentState(this.qTable, 0).reduce((iMax:any, x:any, i:any, arr:any) => x > arr[iMax] ? i : iMax, 0);
      
      return index_of_best_action

    } else {
      //console.log("This was a random action!")
      return Math.floor(Math.random() * this.actions.length)
    }
  }

  private get_next_state = (action_index:number) => {
    
    for (let i = 0; i < this.getUIElements().length; i++) {
      let element = this.getUIElement(i);

      for (let j = 0; j < element.getState_Count(); j++) {

        if(this.actions[action_index] === `${element.getName()}_action${j}`){

          if(element.getState() !== j){
            // Agent is able to perform action, update this.action_index
            this.action_index = action_index
            element.setState(j)
          } else {
            // cant do alrady there
            this.get_next_state(this.get_next_action(this.epsilon))
          }
        }
      }
    }

    if(this.actions[action_index] === 'do_Nothing'){
      // Agent is able to perform action, update this.action_index
      this.action_index = action_index
      //console.log("Action: Doing nothing")
    }
    
    // Update emotional state used as feedback to the action
    this.update_user_emotion();
  }

  // Helper funciton to create ndimensional arrays in JS, no native method exists
  private createNDimArray(dimensions:any) {
    if (dimensions.length > 0) {
      let dim = dimensions[0];
      let rest = dimensions.slice(1);
      let newArray = new Array();
      for (let i = 0; i < dim; i++) {
        newArray[i] = this.createNDimArray(rest);
      }
      return newArray;
    } else {
      return 0;
    }
   }

  private setupActions = () => {
    // Generate Actions based on elements and property count
    let actionsArr:string[] = []
    for (let i = 0; i < this.getUIElements().length; i++) {
      let element = this.getUIElement(i);
      for (let j = 0; j < element.getState_Count(); j++) {
        actionsArr.push(`${element.getName()}_action${j}`)
      }
    }
    actionsArr.push('do_Nothing');
    this.setActions(actionsArr);
  }

  private setupQtable = () => {
    if (localStorage.getItem('qTable') === null) { 
      // Initialize Q-table with 0 values for all pairs
      const arr: number[] = []
  
      for (let i = 0; i < this.UIElements.length; i++) {
        arr.push(this.UIElements[i].getState_Count());
      }
  
      arr.push(this.getEmotionalState().getAvailableState_Count());
      arr.push(this.actions.length)
       
      //@ts-ignore
      this.setQ_Values(this.createNDimArray(arr))
    }
  }

  private setupRewards = () => {
    //Initialize rewards table

    const arr: number[] = []

    for (let i = 0; i < this.UIElements.length; i++) {
      arr.push(this.UIElements[i].getState_Count());
    }

    arr.push(this.getEmotionalState().getAvailableState_Count());

    //@ts-ignore
    this.setRewardsTable(this.createNDimArray(arr))

    // [Element1][Element2][Element3][Element4][Element5][Emotional_State]
    const emotionValues: Record<number, number> = {
      0: 0,  // Neutral
      1: 5,  // Happy
      2: -1,  // Sad
      3: -2,  // Angry
      4: 4, // Fearful
      5: -3, // Disgust
      6: 3  // Surprised
    }
    
    const FillRewards = (currentLayer: any[]) => {
      if (!Array.isArray(currentLayer[0])) {
        const keys = Object.keys(emotionValues);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const value = emotionValues[+key];

          currentLayer[i] = value;
        }
      } else {
        for (let i = 0; i < currentLayer.length; i++) {
          FillRewards(currentLayer[i]);
        }
      }
    }
    FillRewards(this.rewardTable);
  }

  private populateQtable = () => {
    //[FontSize][ColorTheme][Destination][FontType][DialogVisibility][Emotion][Action]
    // Setting initial values for the Q-table
    for (let i = 0; i < this.UIElements[0].getState_Count(); i++) {
      for (let j = 0; j < this.UIElements[1].getState_Count(); j++) {
        for (let k = 0; k < this.UIElements[2].getState_Count(); k++) {
          for (let l = 0; l < this.UIElements[3].getState_Count(); l++) {

              //Popup Active | Anger, Disgust and Sadness
              this.qTable[i][j][k][l][DialogVisibility.VISIBLE][Emotion.ANGRY][Actions.DialogHidden] = 10;
              this.qTable[i][j][k][l][DialogVisibility.VISIBLE][Emotion.DISGUSTED][Actions.DialogHidden] = 10;
              this.qTable[i][j][k][l][DialogVisibility.VISIBLE][Emotion.SAD][Actions.DialogHidden] = 10;

              //ColorTheme Dark | Anger, Disgust and Sadness
              this.qTable[i][ColorThemes.DARK][j][k][l][Emotion.ANGRY][Actions.ColorThemeLight] = 10;
              this.qTable[i][ColorThemes.DARK][j][k][l][Emotion.DISGUSTED][Actions.ColorThemeLight] = 10;
              this.qTable[i][ColorThemes.DARK][j][k][l][Emotion.SAD][Actions.ColorThemeLight] = 10;

              //MapType Dark | Anger, Disgust and Sadness
              this.qTable[i][j][k][MapType.TERRAIN][l][Emotion.ANGRY][Actions.MapTypeSatellite] = 10;
              this.qTable[i][j][k][MapType.TERRAIN][l][Emotion.DISGUSTED][Actions.MapTypeSatellite] = 10;
              this.qTable[i][j][k][MapType.TERRAIN][l][Emotion.SAD][Actions.MapTypeSatellite] = 10;
              
          }
        }
      }
    }
  }

  private setupAgent = () => {
    this.setupActions();
    this.setupQtable();
    this.populateQtable();
    this.setupRewards();
  }


   public run = async (callback: (index_of_last_action:number) => void): Promise<void> => {

    await this.update_user_emotion();

    this.intervalID = setInterval(() => {
      TelemetryService.getInstance().startRecording("Reinforcement Learning");
      let time = Date.now()

      this.action_index = this.get_next_action(this.epsilon)
      
      // Getting snapshot of current state
      const oldStates: number[] = [];
      for (let i = 0; i < this.UIElements.length; i++) {
        oldStates.push(this.getUIElement(i).getState());
      }
      oldStates.push(this.getEmotionalState().getCurrentEmotion());
      
      // Move to next state (Before pushing the choosen action to oldstates, becuase it might get changed if agent picks action leading to its current state)
      this.get_next_state(this.action_index)
      
      oldStates.push(this.action_index)

      const getQTableValue = (currentLayer: any[], depth: number): number => {
        if (depth < oldStates.length - 1) {
          return getQTableValue(currentLayer[oldStates[depth]], depth + 1);
        } 
        return currentLayer[oldStates[depth]];
      }

      const setQTableValue = (currentLayer: any[], depth: number, value: number): void => {
        if (depth < oldStates.length - 1) {
          return setQTableValue(currentLayer[oldStates[depth]], depth + 1, value);
        }
        // @ts-ignore 
        currentLayer[oldStates[depth]] = value;
      }

      // Calculate temporal_difference
      let reward = this.FindValueOfCurrentState(this.rewardTable, 0);
      // @ts-ignore
      this.setRewardSum(reward)

      let old_q_value = getQTableValue(this.qTable, 0);
      // @ts-ignore
      let temporal_difference = reward + (this.gamma * Math.max(...this.FindValueOfCurrentState(this.qTable, 0))) - old_q_value

      // Update Q-value for the previous state and action pair
      let new_q_value = old_q_value + (this.alpha * temporal_difference)
      setQTableValue(this.qTable, 0, new_q_value)

      callback(this.action_index);
      TelemetryService.getInstance().stopRecording();
    }, 1000 * 20)
  }

  public stop = () => {
    if(this.intervalID) {
      clearInterval(this.intervalID)
    }
  }

}
