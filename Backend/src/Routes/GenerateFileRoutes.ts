import express, { Request, Response } from "express";
import IncomingRequestError from "../Errors/IncomingRequestError";
import { GenerateValidExperimentsExcel } from "../Services/FileGenerator";
import fs from 'fs'

export const generateFileRoutes = express.Router();

generateFileRoutes.post("/validExperiments", async (req: Request, res: Response) => {
  
    let experiments = null
  try {
    if(!req.body.participants) throw new IncomingRequestError("The participants must be provided")
    if(!req.body.radioSurveys) throw new IncomingRequestError("The participants must be provided")
    if(!req.body.textSurveys) throw new IncomingRequestError("The participants must be provided")
    if(req.body.experiments){
      experiments = req.body.experiments
    }
    
    const participants = req.body.participants
    const radioSurveys = req.body.radioSurveys
    const textSurveys = req.body.textSurveys

    GenerateValidExperimentsExcel(participants,radioSurveys,textSurveys,experiments)

    res.sendStatus(200)

  } catch (error) {
    return res.sendStatus(404)
  }

})

generateFileRoutes.get("/download", async (req: Request, res: Response) => {
  try {

    const path = './emotionData.xlsx'

    if(fs.existsSync(path)){
      return res.download(path,function(err){
        if(!err){
          const excelPath = './emotionData.xlsx';
          const csvPath = './emotionData.csv'
          try {
            if (fs.existsSync(excelPath)) {
              fs.unlinkSync(excelPath)
            }
          } catch(err) {
            console.error(err)
          }
          try {
            if (fs.existsSync(csvPath)) {
              fs.unlinkSync(csvPath)
            }
          } catch(err) {
            console.error(err)
          }
        }
      })
    } else {
      return res.sendStatus(404)
    }
  } catch (error) {
    return res.sendStatus(404)
  } 
})

