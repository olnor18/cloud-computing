import express, { Request, Response } from "express";
import { app } from "..";
import TextSurveyController from "../Controllers/TextSurveyController";
import IncomingRequestError from './../Errors/IncomingRequestError';
import TextSurvey from './../Models/TextSurvey';
import ScaleSurveyController from './../Controllers/ScaleSurveyController';
import ScaleSurvey from './../Models/ScaleSurvey';

export const surveyRoutes = express.Router();

/**
 * Route for submitting text surveys.
 */
surveyRoutes.post("/text", (req: Request, res: Response) => {
    try {
        if (!Array.isArray(req.body.answers) || req.body.answers.length <= 0) throw new IncomingRequestError("The answers parameter must be a non-empty array");
        if (!req.body.userId) throw new IncomingRequestError("The userId parameter must be provided");

        const surveyController = app.get('TextSurveyController') as TextSurveyController;
        const survey = new TextSurvey(req.body.answers, req.body.userId);
        
        surveyController.create(survey).then((isInserted) => {
            if (isInserted) {
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

/**
 * Route for submitting scale surveys.
 */
surveyRoutes.post("/scale", (req: Request, res: Response) => {
    try {
        if (!Array.isArray(req.body.answers) || req.body.answers.length <= 0) throw new IncomingRequestError("The answers parameter must be a non-empty array");
        if (!req.body.userId) throw new IncomingRequestError("The userId parameter must be provided");
        if (!req.body.experimentNumber) throw new IncomingRequestError("The experimentNumber parameter must be provided");

        const surveyController = app.get('ScaleSurveyController') as ScaleSurveyController;
        const survey = new ScaleSurvey(req.body.answers, req.body.userId, req.body.experimentNumber);
        
        surveyController.create(survey).then((isInserted) => {
            if (isInserted) {
              return res.sendStatus(201);
            };

            return res.sendStatus(500);
        }).catch(() => {
            return res.sendStatus(500);
        });
    } catch (error) {
        if (error instanceof IncomingRequestError) {
            console.log(error.message);
            return res.status(400).send(error.message);
        } else {
            return res.status(500).send(error);
        }
    }
});

/**
 * Route for getting all text surveys.
 */
surveyRoutes.get("/text/all", (req: Request, res: Response) => {
    try {
        const surveyController = app.get('TextSurveyController') as TextSurveyController;
        surveyController.getAll().then((surveys) => {
            if (surveys && surveys.length > 0) {
                return res.send(surveys);
            } else {
                return res.status(404).send("No surveys found");
            }
        }).catch(() => {
            return res.sendStatus(500);
        });
    } catch {
        return res.sendStatus(500);
    }
});

/**
 * Route for getting all scale surveys.
 */
surveyRoutes.get("/scale/all", (req: Request, res: Response) => {
    try {
        const surveyController = app.get('ScaleSurveyController') as ScaleSurveyController;
        surveyController.getAll().then((surveys) => {
            if (surveys && surveys.length > 0) {
                return res.send(surveys);
            } else {
                return res.status(404).send("No surveys found");
            }
        }).catch(() => {
            return res.sendStatus(500);
        });
    } catch {
        return res.sendStatus(500);
    }
});

/**
  * Route for getting all text surveys for a specific user.
  */
surveyRoutes.get("/text/users/:userId", (req: Request, res: Response) => {
    try {
        const surveyController = app.get('TextSurveyController') as TextSurveyController;
        surveyController.getWithFilter({ "userId": req.params.userId }).then((surveys) => {
            if (surveys && surveys.length > 0) {
                return res.send(surveys);
            } else {
                return res.status(404).send("No surveys found for user");
            }
        }).catch(() => {
            return res.sendStatus(500);
        });
    } catch {
        return res.sendStatus(500);
    }
});

/**
 * Route for getting all scale surveys for a specific user.
 */
surveyRoutes.get("/scale/users/:userId", (req: Request, res: Response) => {
    try {
        const surveyController = app.get('ScaleSurveyController') as ScaleSurveyController;
        surveyController.getWithFilter({ "userId": req.params.userId }).then((surveys) => {
            if (surveys && surveys.length > 0) {
                return res.send(surveys);
            } else {
                return res.status(404).send("No surveys found for user");
            }
        }).catch(() => {
            return res.sendStatus(500);
        });
    } catch {
        return res.sendStatus(500);
    }
});

/**
  * Route for getting all scale surveys for a specific experiment number.
  */
surveyRoutes.get("/scale/experiment/:experimentNumber", (req: Request, res: Response) => {
    try {
        const surveyController = app.get('ScaleSurveyController') as ScaleSurveyController;
        surveyController.getWithFilter({ "experimentNumber": +req.params.experimentNumber }).then((surveys) => {
            if (surveys && surveys.length > 0) {
                return res.send(surveys);
            } else {
                return res.status(404).send("No surveys found for experiment number");
            }
        }).catch(() => {
            return res.sendStatus(500);
        });
    } catch {
        return res.sendStatus(500);
    }
});


/**
 * Route for getting all scale surveys for a specific user and experiment number.
 */
surveyRoutes.get("/scale/:userId/:experimentNumber", (req: Request, res: Response) => {
    try {
        const surveyController = app.get('ScaleSurveyController') as ScaleSurveyController;
        surveyController.getWithFilter({ "userId": req.params.userId, "experimentNumber": +req.params.experimentNumber }).then((surveys) => {
            if (surveys && surveys.length > 0) {
                return res.send(surveys);
            } else {
                return res.status(404).send("No surveys found for user and experiment number");
            }
        }).catch(() => {
            return res.sendStatus(500);
        });
    } catch {
        return res.sendStatus(500);
    }
});

/**
 * Route for getting all text surveys with a specific id.
 */
surveyRoutes.get("/text/:id", (req: Request, res: Response) => {
    try {
        const surveyController = app.get('TextSurveyController') as TextSurveyController;
        surveyController.getWithFilter({ "_id": req.params.id }).then((surveys) => {
            if (surveys && surveys.length > 0) {
                return res.send(surveys[0]);
            } else {
                return res.status(404).send("No surveys found with id");
            }
        }).catch(() => {
            return res.sendStatus(500);
        });
    } catch {
        return res.sendStatus(500);
    }
});

/**
 * Route for getting all scale surveys with a specific id.
 */
surveyRoutes.get("/scale/:id", (req: Request, res: Response) => {
    try {
        const surveyController = app.get('ScaleSurveyController') as ScaleSurveyController;
        surveyController.getWithFilter({ "_id": req.params.id }).then((surveys) => {
            if (surveys && surveys.length > 0) {
                return res.send(surveys[0]);
            } else {
                return res.status(404).send("No surveys found with id");
            }
        }).catch(() => {
            return res.sendStatus(500);
        });
    } catch {
        return res.sendStatus(500);
    }
});
