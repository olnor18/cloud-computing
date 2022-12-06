import express from "express";

export const debugRouter = express.Router();

async function sleep(time: number) {
    return new Promise((res, rej) => setTimeout(res, time))
}

debugRouter.get("/stress", async (req, res) => {
    for (let i = 0; i < 1000; i++){
        let a = 2^100*3
        await sleep(10)
    }
    return res.send("Done")
} )
