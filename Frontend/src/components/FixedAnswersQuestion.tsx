import "./FixedAnswersQuestion.scss";

import { useRef } from "react";

interface FixedAnswersQuestionProps {
  label: string,
  possibleAnswers: string[],
  onAnswerSelected: (answerIndex: number) => void
}

const FixedAnswersQuestion = (props: FixedAnswersQuestionProps) => {
  const answerElementRefs = useRef<HTMLInputElement[]>([]);
  answerElementRefs.current = [];

  const addToRefs: (element: HTMLInputElement) => void = (element: HTMLInputElement) => {
    if (element && !answerElementRefs.current.includes(element)) {
      answerElementRefs.current.push(element);
    }
  }

  const handleRadioButtonClicked = (element: HTMLInputElement) => {
    if (element) {
      props.onAnswerSelected(+element.value);
    }
  }

  return (
    <div className="survey-question-container">
      <label className="survey-question-label">{props.label}</label><br />
      <div className="survey-options-container">
        {
          props.possibleAnswers.map((answer, index) => { 
            return (
              <span key={index} className="survey-option-container">
                <input 
                  type="radio"
                  name={props.label}
                  value={index}
                  ref={addToRefs}
                  onClick={event => handleRadioButtonClicked(event.currentTarget)}
                  className="survey-question-radio-button"
                />
                <label className="survey-answer-label">
                  {answer}
                </label>
              </span>
            )
          })
        }
      </div>
    </div>
  )
};

export default FixedAnswersQuestion;