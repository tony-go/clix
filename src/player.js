import spawn from 'cross-spawn';
import splitByLine from 'split2';
import { createRequire } from 'module';

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
   * **Windows ONLY**
   *
   * @description Suspends a process given its ID.
   * @param pid - ID of the process to suspend.
   * @returns `true` if it succeeds or `false` if it fails.
   */
  #pauseProcess = null;

  /**
   * **Windows ONLY**
   *
   * @description Resume a process given its ID.
   * @param pid - ID of the process to resume.
   * @returns `true` if it succeeds or `false` if it fails.
   */
  #continueProcess = null;

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

  #setWindowsControls() {
    if (/^win/.test(process.platform)) {
      const { suspend, resume } = createRequire(import.meta.url)('ntsuspend');
      this.#pauseProcess = suspend;
      this.#continueProcess = resume;
    }
  }

  /**
   * @param {string} command - The command to execute
   * @returns {void}
   * @description Start the player (spawn the process)
   */
  start(command) {
    this.#setWindowsControls();

    // TODO(tony): check this.#context is not null
    const proc = spawn(command, { shell: true });
    const { handler, exitHandler, ...context } = this.#context;

    proc.on('spawn', () => {
      this.#proc = proc;
    });

    proc.on('exit', (code) => {
      exitHandler(code, { ...context, isError: code !== 0 });
    });

    proc.on('error', (line) => {
      this.#pause();
      handler(line, { ...context, isError: true });
    });

    proc.stdout.pipe(splitByLine()).on('data', (line) => {
      this.#pause();
      handler(line, { ...context, isError: false });
    });

    proc.stderr.pipe(splitByLine()).on('data', (line) => {
      this.#pause();
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

  /**
   * @description Pause the player (child process)
   * @returns {void}
   */
  #pause() {
    if (this.#pauseProcess) {
      this.#pauseProcess(this.#proc.pid);
    } else {
      this.#proc.kill('SIGSTOP');
    }
  }

  /**
   * @description Resume the player (child process)
   * @returns {void}
   */
  continue() {
    if (this.#continueProcess) {
      this.#continueProcess(this.#proc.pid);
    } else {
      this.#proc.kill('SIGCONT');
    }
  }
}
