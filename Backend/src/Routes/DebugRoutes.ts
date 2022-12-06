import express from "express";

export const debugRoutes = express.Router();

async function sleep(time: number) {
    return new Promise((res, rej) => setTimeout(res, time))
}

debugRoutes.get("/stress", async (req, res) => {
    let i = req.query.i?.toString() || "8";
    let baseNumber = parseInt(i);
    let result = 0;	
	for (let i = Math.pow(baseNumber, 7); i >= 0; i--) {		
		result += Math.atan(i) * Math.tan(i);
	};
    return res.send("Done")
} )
