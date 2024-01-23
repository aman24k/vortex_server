import { createServer } from 'http';
import express, { Request, Response } from 'express';
import { getIO, initIO } from './signalling';

const app = express();

const httpServer = createServer(app);


initIO(httpServer);

httpServer.listen(3500, () => {
    console.log("Server started on", 3500);
    app.get('/check', (req: Request, res: Response) => {
        res.json({ code: 1234 });
    });
});
getIO();

