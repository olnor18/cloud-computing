import { Server, Socket } from 'socket.io';
import http from 'http';
import { emotionProcessQueue } from './EmotionDataBackgroundProcessor';
import { app } from '..';
import TelemetryController from '../Controllers/TelemetryController';
import Telemetry from '../Models/Telemetry';
import UserController from '../Controllers/UserController';
import ExperimentReport from '../Models/ExperimentReport';
import TaskCompletionStatus from './../Models/TaskCompletionStatus';

export class SocketService {
  private static io: Server;
  
  constructor(server: http.Server) {
    SocketService.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    SocketService.io.on('connection', (socket: Socket) => {
      if (process.env.NODE_ENV === 'development') { 
        this.onTestMessage(socket);
      }

      this.onJoin(socket);
      this.onLeave(socket);

      //this.onTelemetry(socket);
      this.onExperimentStarted(socket);
      this.onExperimentEnded(socket);
      this.onEmotionRecorded(socket);
    });

    SocketService.io.on('disconnect', (socket: Socket) => {
      this.onLeave(socket);
    })
  }

  public static getServerSocket() {
    return SocketService.io;
  }

  private onJoin(socket: Socket) {
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
    });  
  }

  private onLeave(socket: Socket) {
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
    });
  }

  private onTestMessage(socket: Socket) {
    // Used to acknowledge received data
    socket.on("test-message", () => {
      SocketService.io.to(socket.id).emit("ack");
    });
  }

  private onTelemetry = (socket: Socket) => {
    const telemetryController = app.get('TelemetryController') as TelemetryController;
    
    socket.on("telemetry", (data) => {
      telemetryController.create(new Telemetry(data.name, data.duration));
    });
  }

  private onExperimentStarted = (socket: Socket) => {
    const usersController = app.get('UsersController') as UserController;

    socket.on("experiment-started", async (data) => {
      usersController.get(data.userId).then(async (user) => {
        if (user) {
          const experimentReport = user.getExperimentReports().find((experimentReport) => experimentReport.getExperimentNumber() === data.experimentNumber);
          
          if (!experimentReport) {
            user.addExperimentReport(new ExperimentReport(
              data.experimentNumber,
              data.experimentName,
              data.experimentType,
              data.timestamp
            ));

            await usersController.update(user.getId(), user);
          } else {
            await usersController.updateField(
              user.getId(), 
              `experimentReports.${data.experimentNumber - 1}.experimentStarted`,
              data.timestamp
            );
          }
        }
      });
    });  
  };

  private onExperimentEnded = (socket: Socket) => {
    const usersController = app.get('UsersController') as UserController;

    socket.on("experiment-ended", (data: { 
      userId: string, 
      experimentNumber: number, 
      timestamp: number, 
      taskCompleted: boolean, 
      distanceToDestination: number | string 
    }) => {
      usersController.get(data.userId).then(async (user) => {
        if (user) {
          const experimentReport = user.getExperimentReports().find((experimentReport) => experimentReport.getExperimentNumber() === data.experimentNumber);
          if (experimentReport) {
            experimentReport.setExperimentEnded(data.timestamp);
            experimentReport.setTaskCompletionStatus(new TaskCompletionStatus(data.distanceToDestination, data.taskCompleted));
            await usersController.update(user.getId(), user);
          }
        }
      });
    });
  }

  /**
   * The data property of the emotion-recorded event is expected to
   * have the following structure:
   *  {
   *    userId: string,
   *    experimentNumber: 1 | 2 | 3 | 4,
   *    emotions: { 
   *      emotionName: string,
   *      intensity: number
   *    }[],
   *    timesliceStart: number,
   *    timesliceEnd: number
   *  }
   */
  private onEmotionRecorded = (socket: Socket) => { 
    socket.on('emotion-recorded', async (emotionData) => { 
      await emotionProcessQueue.add('EmotionProcessingJob', {
        emotionData: emotionData,
        clientSocketId: socket.id,
        jobType: "emotion"
      });
    });
  }
}
