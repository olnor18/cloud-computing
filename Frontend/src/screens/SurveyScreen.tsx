import "./SurveyScreen.scss";
import { FormEvent, useRef } from 'react';
import constants from "../common/Constants";
import { useContext } from 'react';
import { UserContext } from "../context/UserContext";

const SurveyScreen = () => { 
  const a1Ref = useRef<HTMLInputElement>(null);
  const a2Ref = useRef<HTMLInputElement>(null);
  const a3Ref = useRef<HTMLInputElement>(null);
  const a4Ref = useRef<HTMLInputElement>(null);

  const userContext = useContext(UserContext);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const res = await fetch(`${constants.serverBaseURL}/surveys/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify({
        userId: userContext.id,
        answers: [
          a1Ref.current?.value,
          a2Ref.current?.value,
          a3Ref.current?.value,
          a4Ref.current?.value
        ]
      })
    });

    if (res.ok) {
      window.location.href = "/end"; 
    }
  }

  return (
    <>
      <h1 style={{ textAlign: "center" }}>Final Survey</h1>

      <form className="survey_form" onSubmit={handleSubmit}>
        
        <h3>Question 1</h3>
        <label>What features do you find most valuable and why?</label><br />
        <input type="text" name="q1" placeholder="Answer" maxLength={1500} ref={a1Ref} />

        <h3>Question 2</h3>
        <label>If you could change one thing in this product, what would it be and why?</label><br />
        <input type="text" name="q2" placeholder="Answer" maxLength={1500} ref={a2Ref} />

        <h3>Question 3</h3>
        <label>How would you rate your experience with this app?</label><br />
        <input type="text" name="q3" placeholder="Answer" maxLength={1500} ref={a3Ref} />

        <h3>Question 4</h3>
        <label>Any specific notes?</label><br />
        <input type="text" name="q4" placeholder="Answer" maxLength={1500} ref={a4Ref} />
          
        <button type="submit" >Submit</button>
      </form>
    </>
  )
}

export default SurveyScreen;
