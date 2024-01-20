import { Server, Socket as OriginalSocket } from "socket.io";
import { Server as HttpServer } from "http";

interface Socket extends OriginalSocket {
    user?: string;
}

let IO: Server;

export const initIO = (httpServer: HttpServer): void => {
    IO = new Server(httpServer);

    IO.use((socket: Socket, next: (err?: Error) => void) => {
        if (socket.handshake.query) {
            let callerId = socket.handshake.query.callerId as string;
            if (callerId) {
                socket.user = callerId;
                next();
            } else {
                socket.emit("error", "Caller ID is empty")
                console.log("Caller ID is empty")
            }
        } else {
            socket.emit("error", "Query is empty")
            console.log("Query is empty")
        }
    });

    IO.on("connection", (socket: Socket) => {
        console.log(socket.user, "Connected");
        if (socket.user) socket.join(socket.user);

        socket.on("call", (data: { calleeId: string; rtcMessage: any }) => {
            let calleeId = data.calleeId;
            let rtcMessage = data.rtcMessage;

            socket.to(calleeId).emit("newCall", {
                callerId: socket.user,
                rtcMessage: rtcMessage,
            });
        });

        socket.on("answerCall", (data: { callerId: string; rtcMessage: any }) => {
            let callerId = data.callerId;
            let rtcMessage = data.rtcMessage;

            socket.to(callerId).emit("callAnswered", {
                callee: socket.user,
                rtcMessage: rtcMessage,
            });
        });

        socket.on("ICEcandidate", (data: { calleeId: string; rtcMessage: any }) => {
            console.log("ICEcandidate data.calleeId", data.calleeId);
            let calleeId = data.calleeId;
            let rtcMessage = data.rtcMessage;
            console.log("socket.user emit", socket.user);

            socket.to(calleeId).emit("ICEcandidate", {
                sender: socket.user,
                rtcMessage: rtcMessage,
            });
        });
        socket.on("disconnect", () => {
            console.log(socket.user, "Disconnected");
        });
    });
};

export const getIO = (): Server => {
    if (!IO) {
        throw new Error("IO not initialized.");
    } else {
        return IO;
    }
};

