import spawn from 'cross-spawn';
import splitByLine from 'split2';

export class Player {
  #proc = null;

  dataHandler = null;

  stop() {
    this.#proc.kill('SIGINT');
  }

  start(command) {
    const proc = spawn(command, { shell: true });

    proc.on('spawn', () => {
      this.#proc = proc;
    });

    proc.on('exit', (code) => {
      this.dataHandler(code, code !== 0);
    });

    proc.on('error', (line) => {
      this.dataHandler(line, true);
    });

    proc.stdout.pipe(splitByLine()).on('data', (line) => {
      this.dataHandler(line, false);
    });

    proc.stderr.pipe(splitByLine()).on('data', (line) => {
      this.dataHandler(line, true);
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
