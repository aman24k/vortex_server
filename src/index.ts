import { createServer } from 'http';
import express, { Response } from 'express';
import { getIO, initIO } from './signalling';

const app = express();

app.get('/test', (res: Response) => {
    res.send("Reachable")
});

const httpServer = createServer(app);


initIO(httpServer);

httpServer.listen(3500, () => {
    console.log("Server started on", 3500);
});

getIO();

