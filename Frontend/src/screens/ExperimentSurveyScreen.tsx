import "./ExperimentSurveyScreen.scss";

import { FormEvent, useContext, useEffect, useState } from "react";
import FixedAnswersQuestion from "../components/FixedAnswersQuestion";
import constants from "../common/Constants";
import { UserContext } from "../context/UserContext";
import { ExperimentCounterService } from './../services/ExperimentCounterService';

const ExperimentSurveyScreen = () => {
  const userContext = useContext(UserContext);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [formIsValid, setFormIsValid] = useState(false);
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const res = await fetch(`${constants.serverBaseURL}/surveys/scale`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify({
        userId: userContext.id,
        answers: selectedAnswers,
        experimentNumber: ExperimentCounterService.getExperimentCount() + 1
      })
    });

    if (res.ok) {
      ExperimentCounterService.incrementExperimentCount();
      window.location.href = (ExperimentCounterService.getExperimentCount() < 7) ? "/main" : "/survey"; 
    }
  }

  const onAnswerSelected = (questionIndex: number, answerIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
  }

  useEffect(() => {
    // @ts-ignore
    setFormIsValid(selectedAnswers.length === 4 && !selectedAnswers.includes(undefined));
  }, [selectedAnswers]);

  return (
    <>
      <h1 className="survey-title">Experiment {ExperimentCounterService.getExperimentCount() + 1} Questions</h1>
      <form onSubmit={handleSubmit} className="survey-form">
        <FixedAnswersQuestion 
          label="Were you able to complete the evacuation task?" 
          possibleAnswers={["Yes", "No"]}
          onAnswerSelected={(answerIndex) => onAnswerSelected(0, answerIndex)} 
        />
        <FixedAnswersQuestion 
          label="How easy was the task for you?"
          possibleAnswers={["Very easy", "Easy", "Medium", "Hard", "Very hard"]}
          onAnswerSelected={(answerIndex) => onAnswerSelected(1, answerIndex)} 
        />
        <FixedAnswersQuestion 
          label="Do you feel satisfied using this version of the application?"
          possibleAnswers={["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"]}
          onAnswerSelected={(answerIndex) => onAnswerSelected(2, answerIndex)} 
        />
        <FixedAnswersQuestion 
          label="How satisfied were you by the frequency of changes in the interface?"
          possibleAnswers={["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"]}
          onAnswerSelected={(answerIndex) => onAnswerSelected(3, answerIndex)} 
        />

        <button type="submit" disabled={!formIsValid}>Submit Answers</button>
      </form>
    </>
  )
}

export default ExperimentSurveyScreen;
