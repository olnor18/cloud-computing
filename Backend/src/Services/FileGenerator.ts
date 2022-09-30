import fs from 'fs'
import path from 'path'
//@ts-ignore
var XLSX = require("xlsx");



interface RadioSurvey {
  answers: number[],
  userId:string,
  experimentNumber:number,
  _id:string,
}

interface TextSurvey {
  answers: string[],
  userId:string,
  _id:string,
}

interface Participant {
  experimentReports:{
    experimentNumber:number,
    emotionSnapshots:{
        emotions:{
          emotionName:string,
          intensity:number
        }[],
        timesliceStart:string,
        timesliceEnd:string,
      }[],
      adaptions?:{
        adaptionName:string,
        timestamp:string
      }[]
  }[],
  _id:string
}

const filenameXLSX = "emotionData.xlsx"
const filenameCSV = "emotionData.csv"

type combinedData = {
  userID:string,
  experimentNumber:number,
  surprise:number
  happy:number
  fear:number
  neutral:number
  disgust:number
  sad:number
  angry:number
  sliceStart:string,
  sliceEnd:string,
  adaptationTime:string,
  adaptationName:string,
  q1:string,
  q2:string,
  q3:string,
  q4:string,
  finalQ1:string,
  finalQ2:string,
  finalQ3:string,
  finalQ4:string,
}

export const GenerateValidExperimentsExcel = (data:Participant[],radioSurveyData:RadioSurvey[],textSurveyData:TextSurvey[],experiments:number | null) => {

  const yesNoAnswer = {
    0: "Yes",
    1: "No"
  }
  
  const simplenessAnswer = {
    0: "Very easy",
    1: "Easy",
    2: "Medium",
    3: "Hard",
    4: "Very hard"
  }
  
  const satisfactionAnswer = {
    0: "Very satisfied",
    1: "Satisfied",
    2: "Neutral",
    3: "Dissatisfied",
    4: "Very dissatisfied"
  }

  const combinedParticipantAndSurveyData:combinedData[] = []

  const generateDataToWrite = () => {
    let userID:string = ''
    let experimentNumber:number = 0
    let surprise = 0;
    let happy = 0;
    let fear = 0;
    let neutral = 0;
    let disgust = 0;
    let sad = 0;
    let angry = 0;
    let sliceStart = ''
    let sliceEnd = ''
    let adaptationTime = 'NULL'
    let adaptationName = 'NULL'
    let q1 = ''
    let q2 = ''
    let q3 = ''
    let q4 = ''
    let finalQ1 = ''
    let finalQ2 = ''
    let finalQ3 = ''
    let finalQ4 = ''

    for (let i = 0; i < data.length; i++) {
      const participant = data[i];
      userID = participant._id
      
      for (let j = 0; j < participant.experimentReports.length; j++) {
        const experiment = participant.experimentReports[j];
        
        if(experiments !== null){
          if (experiments !== experiment.experimentNumber) continue
        }
        
        experimentNumber = experiment.experimentNumber

        for (let k = 0; k < experiment.emotionSnapshots.length; k++) {
          const emotionSnapshot = experiment.emotionSnapshots[k];
          sliceStart = emotionSnapshot.timesliceStart
          sliceEnd = emotionSnapshot.timesliceEnd
          adaptationTime = "NULL"
          adaptationName = "NULL"

          let sliceStartMillisec = +new Date(sliceStart)
          let sliceEndMillisec = +new Date(sliceEnd)
          
          for (let l = 0; l < experiment.adaptions!.length; l++) {
            const adaptation = experiment.adaptions![l];
            
            let adaptationTimeStampMillisec = +new Date(adaptation.timestamp)
            
            if(sliceStartMillisec <= adaptationTimeStampMillisec && adaptationTimeStampMillisec <= sliceEndMillisec){
              adaptationTime = adaptation.timestamp
              adaptationName = adaptation.adaptionName
            }
          }
          
          for (let m = 0; m < emotionSnapshot.emotions.length; m++) {
            const emotion = emotionSnapshot.emotions[m];

            switch (emotion.emotionName) {
              case 'happy':
                happy = emotion.intensity
                break;
              case 'surprised':
                surprise = emotion.intensity
                break;
              case 'neutral':
                neutral = emotion.intensity
                break;
              case 'sad':
                sad = emotion.intensity
                break;
              case 'fearful':
                fear = emotion.intensity
                break;
              case 'angry':
                angry = emotion.intensity
                break;
              case 'disgusted':
                disgust = emotion.intensity
                break;
              default:
                break;
            }
          }
          
          for (let n = 0; n < radioSurveyData.length; n++) {
            const radioSurvey = radioSurveyData[n];
            if (radioSurvey.userId === userID && radioSurvey.experimentNumber){
              for (let o = 0; o < radioSurvey.answers.length; o++) {
                const answer = radioSurvey.answers[o];

                switch (o) {
                  case 0:
                    //@ts-ignore
                    q1 = yesNoAnswer[answer]
                    break;
                  case 1:
                    //@ts-ignore
                    q2 = simplenessAnswer[answer]
                    break;
                  case 2:
                    //@ts-ignore
                    q3 = simplenessAnswer[answer]
                    break;
                  case 3:
                    //@ts-ignore
                    q4 = satisfactionAnswer[answer]
                    break;
                  default:
                    break;
                  }
              }
            }
          }

          for (let p = 0; p < textSurveyData.length; p++) {
            const textSurvey = textSurveyData[p];
            if (textSurvey.userId === userID){
              for (let q = 0; q < textSurvey.answers.length; q++) {
                const answer = textSurvey.answers[q];
                if(q === 0){
                  finalQ1 = answer
                }
                if(q === 1){
                  finalQ2 = answer
                }
                if(q === 2){
                  finalQ3 = answer
                }
                if(q === 3){
                  finalQ4 = answer
                }
              }
            }
          } // END textSurvey
                    combinedParticipantAndSurveyData.push(
            {
              userID,experimentNumber,surprise,happy,fear,neutral,disgust,sad,angry,sliceStart,sliceEnd,adaptationTime,adaptationName,q1,q2,q3,q4,finalQ1,finalQ2,finalQ3,finalQ4
            }
          )
        } // END EmotionSnapshot
      } // END Experiment
      
    } // END Participant
  } // END GenerateDateToWrite


  const writeResultsToCSV = async (filename:string) => {
    return new Promise((resolve, reject) => {
      try {
        fs.writeFileSync(filename,"UserID,ExperimentNumber,Surprise,Happy,Fear,Neutral,Disgust,Sad,Angry,SliceStart,SliceEnd,AdaptationTime,AdaptationName,Q1,Q2,Q3,Q4,FinalQ1,FinalQ2,FinalQ3,FinalQ4")
  
        for (let i = 0; i < combinedParticipantAndSurveyData.length; i++) {
          let e = combinedParticipantAndSurveyData[i]
          let stringToAppend = `\r\n${e.userID},${e.experimentNumber},${e.surprise},${e.happy}, ${e.fear},${e.neutral}, ${e.disgust},${e.sad},${e.angry},${e.sliceStart},${e.sliceEnd},${e.adaptationTime},${e.adaptationName},${e.q1},${e.q2},${e.q3},${e.q4},${e.finalQ1},${e.finalQ2},${e.finalQ3},${e.finalQ4}`
          fs.appendFileSync(filename, stringToAppend)
        }
  
        resolve(true)
      } catch (error) {
        reject()
      }
    }) 
  }
  
  const parseToXLSX = () => {
  
  let source = path.resolve(path.join(process.cwd(),filenameCSV))
  let destination = path.resolve(path.join(process.cwd(),filenameXLSX))
  
    try {
      let workbook = XLSX.readFile(source);
      XLSX.writeFile(workbook, destination);
    } catch (e:any) {
      console.error(e.toString());
    }
  }

  generateDataToWrite()
  writeResultsToCSV(filenameCSV).then( res => {
    parseToXLSX()
  })
}



