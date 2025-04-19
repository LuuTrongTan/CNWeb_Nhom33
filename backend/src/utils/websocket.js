const WebSocket = require("ws");

let wss;

const initWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });
};

const broadcastOrderUpdate = (orderId, orderStatus) => {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "ORDER_UPDATE",
          orderId,
          orderStatus,
        })
      );
    }
  });
};

module.exports = {
  initWebSocket,
  broadcastOrderUpdate,
};
