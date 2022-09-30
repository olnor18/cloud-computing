import './IntroductionScreens.scss';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ExperimentCounterService } from '../services/ExperimentCounterService';

const IntroductionScreen = () => {

  useEffect(() => {
    ExperimentCounterService.reset();
  }, [])

  return (
    <div className="container">
      <h1>Introduction</h1>

      <div className='paragraphs'>
        <p>
          The goal of this app is to simulate evacuation from a building, in case of a fire.
        </p>
        <p>
          You will be asked to complete 4 simulated evacuations. Each simulation takes 2 minutes.
          During each simulation, The app will show you a route from your current location to a random destination. 
          Your goal is to walk towards the destination until the time runs out.
        </p>
        <p>
          After each simulation, you will be presented with a short survey,
          which must be submitted before you can begin the next simulation.
        </p>
      </div>
      
      <Link to='/consent' className='button'>
        Next Page
      </Link>
    </div>
  )
}

export default IntroductionScreen;