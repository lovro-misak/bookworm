import { WebSocketServer, WebSocket } from "ws";
import { subscriber } from "./redis";
import jwt, { type JwtPayload } from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_!2J#lR8vKm$5xZ7pD9c@";

const clients = new Map<string, WebSocket>();

export const setupWebSocketServer = (server: any) => {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws, req) => {
        const token = req.url?.split("?token=")[1];
        console.log("Current clients keys:", [...clients.keys()]);

        if (token){
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const id = String((decoded as JwtPayload).id);

                clients.set(id, ws);
                console.log(`User ${id} connected`);

                subscriber.psubscribe(`notify:${id}`, (err) => {
                    if (err) {
                        console.error("Redis psubscribe error: ", err);
                    } else {
                        console.log(`User ${id} subscribed to notify:${id}`);
                    }
                });

                ws.on("close", () => {
                    clients.delete(id);
                    console.log(`User ${id} disconnected`);
                });
            } catch (err) {
                console.error("WebSocket auth failed:", err);
            return;
            }
            
        } else {
            console.log("Error with token");
            return; 
        }
        
    });

    wss.on('listening', () => {
        console.log('WebSocket server listening');
    });

    wss.on('error', (error) => {
        console.error('WebSocket server error:', error);
    });

    /*subscriber.psubscribe("notify:*", (err) => {
        if (err) {
            console.error("Redis psubscribe error: ", err);
        } 
    });*/

    subscriber.on("pmessage", (pattern, channel, message) => {
        console.log("channel: ", channel);
        const id = channel.split(":")[1];
        console.log("id: ", id);
        const ws = clients.get(id);
        console.log("ws: ", ws);
        if (ws) {
            console.log(`Socket readyState for ${id}:`, ws.readyState);
            if (ws.readyState === ws.OPEN) {
                ws.send(message);
                console.log(`Message sent to ${id}`);
            } else {
                console.log(`Socket not open for ${id}, state: ${ws.readyState}`);
            }
        }
        console.log("subscriber on pmessage");
    });
}