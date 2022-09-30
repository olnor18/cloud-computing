import { Queue, Worker, QueueEvents } from 'bullmq';
import { app } from '..';
import Emotion from '../Models/Emotion';
import EmotionSnapshot from '../Models/EmotionSnapshot';
import ExperimentReport, { ExperimentTypes } from '../Models/ExperimentReport';
import User from '../Models/User';
import UserController from './../Controllers/UserController';
import { SocketService } from './SocketService';
import IORedis from 'ioredis';

const connectionString: string | undefined = process.env.REDIS_URI;
const connection = new IORedis(connectionString ? connectionString : '', { // TODO: Create new redis service berfore the experiment
  maxRetriesPerRequest: null
});

export const emotionProcessQueue = new Queue('EmotionProcessingQueue', { connection });

const emotionQueueEvents = new QueueEvents('EmotionProcessingQueue', { connection }); 

const emotionWorker = new Worker('EmotionProcessingQueue', async (job) => {
  if (job.name === 'EmotionProcessingJob') {
    await processEmotionQueueItem(
      job.data.emotionData,
      job.data.clientSocketId,
    );
  }
}, { connection }); 

type IncomingEmotionData = { 
  userId: string;
  experimentName: string;
  experimentType: ExperimentTypes;
  experimentNumber: number;
  emotions: {
    emotionName: string;
    intensity: number; 
  }[]; 
  timesliceStart: number; 
  timesliceEnd: number;
}

const processEmotionQueueItem = async (data: IncomingEmotionData, clientSocketId: string) => {
  try {
    const userController: UserController = app.get('UsersController');
    // Get user from the database if it exists, otherwise create a new one
    let user = await userController.get(data.userId !== undefined ? data.userId : '');
    if (!user) {
      user = new User(undefined, data.userId);
      await userController.create(user);
    } 

    // Check if the user has an associated experiment report for the current experiment
    let experimentReport: ExperimentReport | undefined = user.getExperimentReports().find(
      (experimentReport: ExperimentReport) => experimentReport.getExperimentNumber() === data.experimentNumber
    );

    // If no experiment report exists, create one
    if (!experimentReport) {
      experimentReport = new ExperimentReport(
        data.experimentNumber,
        data.experimentName,
        data.experimentType,
        +new Date()
      );
      user.addExperimentReport(experimentReport);
      await userController.update(user.getId(), user);
    } 

    // Create an array of all received emotions
    const emotions = data.emotions.map((emotion: { emotionName: string, intensity: number }) => {
      return new Emotion(
        emotion.emotionName,
        emotion.intensity
      );
    }).sort((a: Emotion, b: Emotion) => {
      return b.getIntensity() - a.getIntensity();
    });

    // Create emotion snapshot and add it to the experiment report
    const emotionSnapshot = new EmotionSnapshot(
      emotions,
      new Date(data.timesliceStart),
      new Date(data.timesliceEnd)
    );

    experimentReport.addEmotionSnapshot(emotionSnapshot);
    
    await userController.updateField(
      user.getId(),
      `experimentReports.${data.experimentNumber - 1}.emotionSnapshots`,
      [...experimentReport.getEmotionSnapshots(), emotionSnapshot]
    );

    if (process.env.NODE_ENV === 'development') {
      SocketService.getServerSocket().to(clientSocketId).emit('emotion-recorded-ack');;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log(error);
    }
  }
}

emotionQueueEvents.on('completed', ({ jobId }) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('done processing job:', jobId);
  }
});

emotionQueueEvents.on('failed', ({ jobId, failedReason }: { jobId: string, failedReason: string }) => {
  if (process.env.NODE_ENV === 'development') { 
    console.error('error occured while processing job:', jobId, failedReason);
  }
});
