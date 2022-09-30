import { createContext, useContext, useEffect, useState } from "react";
import { Actions, RLAgent } from "../adaptions/RLAgent";
import { RuleBasedAgent } from "../adaptions/RuleBasedAgent";
import { Adaptions, ColorThemes, Destination, DialogVisibility, Emotion, FontSizes, MapType } from "../common/Enums";
import { ExperimentCounterService } from "../services/ExperimentCounterService";
import { UIElement } from './../adaptions/UIElement';
import { UserContext } from "./UserContext";
import { EmotionSnapshot } from "../common/Types";
import constansts from './../common/Constants';
import { AdaptionRecorder } from "../services/AdaptionRecorder";
import { TelemetryService } from "../services/TelemetryService";

export enum ExperimentStatus {
  NOT_STARTED,
  RUNNING,
  FINISHED
}

export enum adaptionModes {
  SEQUENTIAL,
  RULE_BASED,
  REINFORCEMENT_LEARNING,
  NONE
}

const adaptionModesList = [
  adaptionModes.REINFORCEMENT_LEARNING,
  adaptionModes.NONE,
  adaptionModes.REINFORCEMENT_LEARNING,
  adaptionModes.SEQUENTIAL,
  adaptionModes.REINFORCEMENT_LEARNING,
  adaptionModes.RULE_BASED,
  adaptionModes.REINFORCEMENT_LEARNING
]

const UIStateDefault = {
  uiState: {
    fontSize: FontSizes.MEDIUM,
    colorTheme: ColorThemes.LIGHT,
    mapType: MapType.SATELLITE,
    dialogVisibility: DialogVisibility.HIDDEN
  },
  experimentState: {
    experimentStatus: ExperimentStatus.NOT_STARTED
  },
  utility: {
    updateEmotion: (emotion: Emotion) => {},
    updateEmotions: (emotions: EmotionSnapshot) => {},
    emitAdaptions: async () => { return true }
  }
}

type AdaptionContextProviderProps = {
  children: React.ReactNode,
  isExperimentStarted: boolean,
}

export const AdaptionContext = createContext(UIStateDefault);

export const AdaptionContextProvider = (props: AdaptionContextProviderProps) => {
  const [currentFontSize, setFontSize] = useState(UIStateDefault.uiState.fontSize);
  const [currentColorTheme, setColorTheme] = useState(UIStateDefault.uiState.colorTheme);
  const [currentMapType, setMapType] = useState(UIStateDefault.uiState.mapType);
  const [currentDialogVisibility, setDialogVisibility] = useState(UIStateDefault.uiState.dialogVisibility);
  const [experimentStatus, setExperimentStatus] = useState<ExperimentStatus>(ExperimentStatus.NOT_STARTED);
  const [rlAgent, setRLAgent] = useState<RLAgent>();
  const [ruleBasedAgent, setRuleBasedAgent] = useState<RuleBasedAgent>();
  const [timer, setTimer] = useState<NodeJS.Timer | undefined>(undefined);
  const [adaptionList, setAdaptionList] = useState<number[]>([
    Adaptions.CHANGE_FONT_SIZE,
    Adaptions.CHANGE_COLOR_THEME,
    Adaptions.CHANGE_MAP_TYPE,
    Adaptions.CHANGE_DIALOG_VISIBILITY
  ]);

  const userContext = useContext(UserContext);

  useEffect(() => {
    const uiElements: UIElement[] = [
      new UIElement(Object.keys(FontSizes).length / 2, FontSizes.MEDIUM, "FontSize"),
      new UIElement(Object.keys(ColorThemes).length / 2, ColorThemes.LIGHT, "ColorTheme"),
      new UIElement(Object.keys(Destination).length / 2, Destination.A, "Destination"),
      new UIElement(Object.keys(MapType).length / 2, MapType.TERRAIN, "MapType"),
      new UIElement(Object.keys(DialogVisibility).length / 2, DialogVisibility.HIDDEN, "DialogVisibility")
    ];

    setRLAgent(new RLAgent(uiElements));
    setRuleBasedAgent(new RuleBasedAgent());

    TelemetryService.getInstance().reset();
  }, []);

  let intervalID:(NodeJS.Timer|undefined)
  
  useEffect(() => {
    if (props.isExperimentStarted) { 
      if (experimentStatus === ExperimentStatus.RUNNING || experimentStatus === ExperimentStatus.FINISHED) {
        alert("The Experiment has already been startedstarted. Status: " + (experimentStatus === ExperimentStatus.FINISHED ? "FINISHED" : "STARTED"));
        return
      }
      startExperiment();
    } else {
      stop();
    }
  }, [props.isExperimentStarted]);


  const RLAgentUpdateState = (action_index: Actions) => {
    switch (action_index) {
      case Actions.FontSizeMedium:
        setFontSize(FontSizes.MEDIUM)
        recordAdaption("FontSizeNormal");
        break;
      case Actions.FontSizeLarge:
        setFontSize(FontSizes.LARGE);
        recordAdaption("FontSizeLarge");
        break;
      case Actions.ColorThemeLight:
        setColorTheme(ColorThemes.LIGHT);
        recordAdaption("ColorThemeLight");
        break;
      case Actions.ColorThemeDark:
        setColorTheme(ColorThemes.DARK);
        recordAdaption("ColorThemeDark");
        break;
      case Actions.MapTypeTerrain:
        setMapType(MapType.TERRAIN);
        recordAdaption("MapTypeTerrain");
        break;
      case Actions.MapTypeSatellite:
        setMapType(MapType.SATELLITE);
        recordAdaption("MapTypeSatellite");
        break;
      case Actions.DialogHidden:
        setDialogVisibility(DialogVisibility.HIDDEN);
        recordAdaption("PopupHidden");
        break;
      case Actions.DialogVisible:
        setDialogVisibility(DialogVisibility.VISIBLE);
        recordAdaption("PopupVisible");
        break;
      case Actions.DoNothing:
        recordAdaption("DoNothing");
        break;
    }
  }

  const RLAdaptionRunner = () => {
    if (!rlAgent) throw new Error("Reinforcement Learning Agent not initialized");

    setExperimentStatus(ExperimentStatus.RUNNING);

    if (localStorage.getItem("qtable") !== null) {
      rlAgent.setQ_Values(JSON.parse(localStorage.getItem("qtable") as string));
    }

    rlAgent.run(
      RLAgentUpdateState
    )
  }

  const sequentialAdaptionRunner = () => {
    let i = 0;
    setExperimentStatus(ExperimentStatus.RUNNING);
    
    const timer = setInterval(() => {
      TelemetryService.getInstance().startRecording("Sequential");
      if (i < adaptionList.length) {
        triggerAdaptation(adaptionList[i]);
      }
      
      if (i >= adaptionList.length) {
        stop();
      }
      
      i++;
      TelemetryService.getInstance().stopRecording();
    }, 20 * 1000);

    setTimer(timer);
  }

  const ruleBasedAdaptionRunner = () => {
    if (!ruleBasedAgent) throw new Error("Rule-Based Agent not initialized");

    setExperimentStatus(ExperimentStatus.RUNNING);

    ruleBasedAgent.run(
      triggerAdaptation
    )
  }

  const startExperiment = () => {
    const currentAdaptionMode = adaptionModesList[ExperimentCounterService.getExperimentCount()];

    switch (currentAdaptionMode) {
      case adaptionModes.SEQUENTIAL:
        sequentialAdaptionRunner();
        break;
      case adaptionModes.REINFORCEMENT_LEARNING:
        RLAdaptionRunner();
        break;
      case adaptionModes.RULE_BASED:
        ruleBasedAdaptionRunner();
        break;
    }
  }
  
  const triggerAdaptation = (adaption: Adaptions) => {
    switch (adaption) {
      case Adaptions.CHANGE_FONT_SIZE:
        setFontSize(FontSizes.LARGE);
        recordAdaption("FontSizeLarge");
        break;
      case Adaptions.CHANGE_COLOR_THEME:
        setColorTheme(ColorThemes.DARK);
        recordAdaption("ColorThemeDark");
        break;
      case Adaptions.CHANGE_MAP_TYPE:
        setMapType(MapType.TERRAIN);
        recordAdaption("MapTypeTerrain");
        break;
      case Adaptions.CHANGE_DIALOG_VISIBILITY:
        setDialogVisibility(DialogVisibility.VISIBLE);
        recordAdaption("PopupVisible");
        break;
    }
  };
  
  const stopRLAdaption = () => {
    if (!rlAgent) throw new Error("Reinforcement Learning Agent not initialized");

    rlAgent.stop();
    localStorage.setItem("qtable", JSON.stringify(rlAgent.getQ_values()));
  }

  const stopSequentialAdaption = () => {
    clearInterval(timer);
  }

  const stopRuleBased = () => {
    if (!ruleBasedAgent) throw new Error("Rule-Based Agent not initialized");
    
    ruleBasedAgent.stop();
  }

  const stop = () => {
    try {
      if (experimentStatus !== ExperimentStatus.RUNNING) return

      const currentAdaptionMode = adaptionModesList[ExperimentCounterService.getExperimentCount()];

      switch (currentAdaptionMode) {
        case adaptionModes.SEQUENTIAL:
          stopSequentialAdaption();
          break;
        case adaptionModes.REINFORCEMENT_LEARNING:
          stopRLAdaption();
          break;
        case adaptionModes.RULE_BASED:
          stopRuleBased();
          break;
      }

      setExperimentStatus(ExperimentStatus.FINISHED);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.log(error);
      }
    }
  }

  const updateEmotion = (emotion: Emotion) => {
    if (!rlAgent || !ruleBasedAgent) return;

    rlAgent.addInputEmotion(emotion)
    ruleBasedAgent.addInputEmotion(emotion);
  }

  const updateEmotions = (emotions: EmotionSnapshot) => {
    if (!ruleBasedAgent) return;

    ruleBasedAgent.addInputEmotions(emotions)
  };  

  const recordAdaption = (adaptionName: string) => {
    AdaptionRecorder.addAdaption({
      adaptionName,
      timestamp: +(new Date())
    });
  }

  const emitAdaptions = async () => {
    if (AdaptionRecorder.getAdaptions().length > 0) {
      const emitResult = await fetch(`${constansts.serverBaseURL}/adaptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: userContext.id,
          adaptions: AdaptionRecorder.getAdaptions(),
          experimentNumber: ExperimentCounterService.getExperimentCount() + 1,
        })
      });

      AdaptionRecorder.clearAdaptions();
      return emitResult.ok;
    }

    AdaptionRecorder.clearAdaptions();
    return false;
  }

  return (
    <AdaptionContext.Provider value={{
      uiState: {
        fontSize: currentFontSize,
        colorTheme: currentColorTheme,
        mapType: currentMapType,
        dialogVisibility: currentDialogVisibility
      },
      experimentState: {
        experimentStatus: experimentStatus
      },
      utility: {
        updateEmotion: updateEmotion,
        updateEmotions: updateEmotions,
        emitAdaptions: emitAdaptions
      }
    }}>
      {props.children}
    </AdaptionContext.Provider>
  )
}
