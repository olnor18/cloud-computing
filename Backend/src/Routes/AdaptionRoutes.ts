import express, { Request, Response } from "express";
import { app } from "..";
import UserController from "../Controllers/UserController";
import Adaption from "../Models/Adaption";
import IncomingRequestError from './../Errors/IncomingRequestError';
import ExperimentReport from '../Models/ExperimentReport';

export const adaptionRoutes = express.Router();

/**
 * Route for submitting adaption data.
 */
adaptionRoutes.post("/", async (req: Request, res: Response) => {
    try {
        if (!req.body.userId) throw new IncomingRequestError("The userId parameter must be provided");
        if (!req.body.experimentNumber) throw new IncomingRequestError("The adaptionData parameter must be provided");
        if (!req.body.adaptions) throw new IncomingRequestError("The adaptions parameter must be provided");

        const userController = app.get('UsersController') as UserController;
        const user = await userController.get(req.body.userId);

        if (!user) {
          return res.status(404).send("The provided user id does not exist.");
        }

        const experimentReports = user.getExperimentReports();
        if (!experimentReports) {
          return res.status(404).send("The provided user does not have any experiment reports.");
        }

        const experimentReport = experimentReports.find((report) => report.getExperimentNumber() === req.body.experimentNumber);
        if (!experimentReport) {
          return res.status(404).send("The provided user does not have an experiment report for the provided experiment number.");
        }

        const adaptions = []; 
        for (let i = 0; i < req.body.adaptions.length; i++) {
          adaptions.push(
            new Adaption(
              req.body.adaptions[i].adaptionName,
              new Date(req.body.adaptions[i].timestamp),
            )
          );
        }
        
        userController.updateField(
          user.getId(), 
          `experimentReports.${req.body.experimentNumber - 1}.adaptions`,
          adaptions
        ).then((isUpdated) => {
          if (isUpdated) {
            return res.sendStatus(201);
          };

          return res.sendStatus(500);
        }).catch(() => {
          return res.sendStatus(500);
        });
      } catch (error) {
        if (error instanceof IncomingRequestError) {
          return res.status(400).send(error.message);
        } else {
        return res.status(500).send(error);
      }
    }
});
