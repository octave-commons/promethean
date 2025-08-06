// shared/js/brokerClient.js

import WebSocket from "ws";
import { randomUUID } from "crypto";

export class BrokerClient {
  constructor({ url = "ws://localhost:7000", id = randomUUID() } = {}) {
    this.url = url;
    this.id = id;
    this.socket = null;
    this.handlers = new Map();
    this.onTask = null; // callback(task, queue)
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.url);
      this.socket.on("open", resolve);
      this.socket.on("error", reject);
      this.socket.on("message", (data) => {
        try {
          const msg = JSON.parse(data);
          if ("task" in msg && this.onTask) {
            this.onTask(msg.task, msg.queue);
          } else if (msg.event) {
            const handler = this.handlers.get(msg.event.type);
            if (handler) handler(msg.event);
          }
        } catch (err) {
          console.warn("Invalid broker message", err);
        }
      });
    });
  }

  subscribe(topic, handler) {
    this.socket.send(JSON.stringify({ action: "subscribe", topic }));
    this.handlers.set(topic, handler);
  }

  unsubscribe(topic) {
    this.socket.send(JSON.stringify({ action: "unsubscribe", topic }));
    this.handlers.delete(topic);
  }

  publish(type, payload, opts = {}) {
    const message = {
      type,
      payload,
      source: this.id,
      timestamp: new Date().toISOString(),
      ...opts,
    };
    this.socket.send(JSON.stringify({ action: "publish", message }));
  }

  enqueue(queue, task, opts = {}) {
    const message = { action: "enqueue", queue, task };
    if (opts.ttl) message.ttl = opts.ttl;
    this.socket.send(JSON.stringify(message));
  }

  pull(queue) {
    this.socket.send(JSON.stringify({ action: "pull", queue }));
  }

  ack(taskId) {
    this.socket.send(JSON.stringify({ action: "ack", taskId }));
  }

  fail(taskId, reason = "") {
    this.socket.send(JSON.stringify({ action: "fail", taskId, reason }));
  }

  onTaskReceived(callback) {
    this.onTask = callback;
  }
}
