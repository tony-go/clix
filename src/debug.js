// todo(tony): make something cleaner (pino)
class Debug {
  constructor(command) {
    this.command = command;
  }

  debug(...message) {
    if (process.env.DEBUG) {
      console.log(this.command, message);
    }
  }
}

export { Debug };
