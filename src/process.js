import spawn from 'cross-spawn';
import splitByLine from 'split2';

export class Process {
  #proc = null;
  #subscriptions = {};

  on(eventName, callback) {
    if (!this.#subscriptions[eventName]) {
      this.#subscriptions[eventName] = [];
    }

    this.#subscriptions[eventName].push(callback);
  }

  kill() {
    this.#proc.kill('SIGINT');
  }

  #subscribe(eventName, eventData) {
    const subscribers = this.#subscriptions[eventName];

    for (const callback of subscribers) {
      callback(eventData);
    }
  }

  spawn(command) {
    const proc = spawn(command, { shell: true });

    proc.on('spawn', () => {
      this.#proc = proc;
      this.#subscribe('spawn', proc.pid);
    });

    proc.on('exit', (code) => {
      this.#subscribe('exit', code);
    });

    proc.on('error', (line) => {
      this.#subscribe('error', line);
    });

    proc.stdout.pipe(splitByLine()).on('data', (line) => {
      this.#subscribe('data', line);
    });

    proc.stderr.pipe(splitByLine()).on('data', (line) => {
      this.#subscribe('error', line);
    });
  }

  write(input) {
    if (!this.#proc) {
      throw 'Process was not spawned';
    }

    this.#proc.stdin.setEncoding('utf-8');
    this.#proc.stdin.write(input);
    this.#proc.stdin.end();
  }
}
