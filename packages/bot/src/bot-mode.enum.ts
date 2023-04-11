enum BotMode {
  /** Receives and processes messages locally */
  Local = 'local',

  /** receives messages from platforms and sends them to the queue */
  Gateway = 'gateway',

  /** receives messages from the bridge and processes */
  Worker = 'worker',

  /** sends a message to the bridge and receives it from there for processing. Useful for debugging */
  LocalBridge = 'local_bridge',
}

export default BotMode;
