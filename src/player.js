import spawn from 'cross-spawn';
import splitByLine from 'split2';

export class Player {
  /**
   * @type {ChildProcess}
   */
  #proc = null;

  /**
   * @type {object}
   * @type {object.resolve} function to resolve the promise
   * @type {object.reject} function to reject the promise
   * @type {object.handler} function to handle data
   */
  #context = null;

  /**
   * @param {void}
   * @return {void}
   * @description Stop the player (kill the process)
   */
  stop() {
    this.#proc.kill('SIGINT');
  }

  /**
   * @param {object} context
   * @description Set the context of the player
   */
  setContext(context) {
    this.#context = context;
  }

  /**
   * @param {string} command - The command to execute
   * @returns {void}
   * @description Start the player (spawn the process)
   */
  start(command) {
    // TODO(tony): check this.#context is not null
    const proc = spawn(command, { shell: true });
    const { handler, ...context } = this.#context;

    proc.on('spawn', () => {
      this.#proc = proc;
    });

    proc.on('exit', (code) => {
      handler(code, { ...context, isError: code != 0 });
    });

    proc.on('error', (line) => {
      handler(line, { ...context, isError: true });
    });

    proc.stdout.pipe(splitByLine()).on('data', (line) => {
      handler(line, { ...context, isError: false });
    });

    proc.stderr.pipe(splitByLine()).on('data', (line) => {
      handler(line, { ...context, isError: true });
    });
  }

  /**
   * @param {string} input - The input to send to the player
   * @returns {void}
   * @description Simulate the player input (write in stdin)
   */
  write(input) {
    if (!this.#proc) {
      throw 'Process was not spawned';
    }

    this.#proc.stdin.setEncoding('utf-8');
    this.#proc.stdin.write(input);
    this.#proc.stdin.end();
  }
}
