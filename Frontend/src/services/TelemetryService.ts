import { io, Socket } from "socket.io-client";
import constansts from "../common/Constants";

export class TelemetryService {
  private static instance: TelemetryService;
  private static startTime: Date | null;
  private static endTime: Date | null;
  private static telemetryName: string;
  private static socketConnectionString = constansts.serverBaseURL;
  private static socket: Socket | null = null;

  private constructor() { 
    if (TelemetryService.socketConnectionString) {
      TelemetryService.socket = io(TelemetryService.socketConnectionString);
    }
  }

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  public startRecording(name: string) {
    if (!TelemetryService.startTime) {
      TelemetryService.telemetryName = name;
      TelemetryService.startTime = new Date();
    }
  }

  public stopRecording() {
    if (!TelemetryService.endTime && TelemetryService.startTime) {
      TelemetryService.endTime = new Date();
      this.submitData();
      this.reset();
    }
  }

  private submitData() {
    if (TelemetryService.startTime && TelemetryService.endTime) {
      const duration = TelemetryService.endTime.getTime() - TelemetryService.startTime.getTime();
      //console.log(duration);

      // TelemetryService.socket?.emit("telemetry", {
      //   name: TelemetryService.telemetryName,
      //   duration: duration,
      // });
    }
  }

  public reset() {
    TelemetryService.startTime = null;
    TelemetryService.endTime = null;
    TelemetryService.telemetryName = "";
  }
}
