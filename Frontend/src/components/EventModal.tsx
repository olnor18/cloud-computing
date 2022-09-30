import "./EventModal.scss";

interface EventModalProps { 
  message: string,
  isVisible: boolean,
  onClose: () => void
}

const EventModal = (props: EventModalProps) => {

  return (
    <>
      {props.isVisible &&
        <>
          <div className='modal-background'></div>
          <div className='modal-container'>
            <h2>Attention</h2>
            <p>{props.message}</p>
            <button onClick={props.onClose}>Close Message</button>
          </div>
        </>
      }
    </>
  )
}

export default EventModal;
