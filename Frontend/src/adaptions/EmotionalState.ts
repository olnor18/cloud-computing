export class EmotionalState {
    
    /*  Emotional States
        0 - Happiness (+5)
        1 - Sadness (0)
        2 - Surprise (+2)
        3 - Fear (0)
        4 - Anger (-1)
        5 - Disgust (-3)
        6 - Contempt (-6)
    */

    private current_emotion;
    private maxAvailableStates = 7;

    constructor() {
        this.current_emotion = 0;
    }
    setCurrentEmotionalState = (emotion:number) => {
        this.current_emotion = emotion;
    }
    getCurrentEmotion = () => {
        return this.current_emotion;
    }
    getAvailableState_Count = () => {
        return this.maxAvailableStates;
    }
}