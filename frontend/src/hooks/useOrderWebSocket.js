import { useEffect, useRef } from "react";

const useOrderWebSocket = (orderId, onOrderUpdate) => {
  const ws = useRef(null);

  useEffect(() => {
    // Kết nối WebSocket
    ws.current = new WebSocket(process.env.REACT_APP_WS_URL);

    ws.current.onopen = () => {
      console.log("WebSocket Connected");
      // Subscribe to order updates
      ws.current.send(
        JSON.stringify({
          type: "SUBSCRIBE_ORDER",
          orderId,
        })
      );
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "ORDER_UPDATE" && data.orderId === orderId) {
        onOrderUpdate(data.orderStatus);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    // Cleanup
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [orderId, onOrderUpdate]);

  return ws.current;
};

export default useOrderWebSocket;
