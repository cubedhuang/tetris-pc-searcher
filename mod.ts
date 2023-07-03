import {
	Board,
	M,
	Move,
	PIECES,
	ROTATION_COUNTS,
	canPlacePiece,
	clearLines,
	createBoard,
	movesToString,
	pieceToM,
	placePiece,
	rotate
} from "./util.ts";

const solved = new Set<string>();

const HARD_DROP = true;
const ROWS = 4;
const COLS = 8;

let m = 0;

const workingSequences = new Set<string>();

const secondBag = [M.O, M.I, M.T, M.L, M.J, M.S, M.Z];

function dfs(board: Board, moves: Move[], unused: M[]): void {
	clearLines(board);

	if (moves.length && board.every(row => row.every(p => p === M._))) {
		const m = movesToString(moves);

		if (solved.has(m)) return;

		const seq = moves.map(({ piece }) => pieceToM(piece)).join("");
		workingSequences.add(seq);

		solved.add(m);

		return;
	}

	if (!unused.length) unused = secondBag;

	for (let i = 0; i < unused.length; i++) {
		let piece = PIECES[unused[i]];

		const [p] = unused.splice(i, 1);

		for (let i = 0; i < ROTATION_COUNTS[p]; i++) {
			for (let row = 0; row < ROWS; row++) {
				for (let col = 0; col < COLS; col++) {
					const move = { piece, row, col };

					if (canPlacePiece(board, move, HARD_DROP)) {
						m++;

						if (m % 100000 === 0) console.log(m);

						const newBoard = board.map(row => [...row]);

						placePiece(newBoard, move);

						moves.push(move);

						dfs(newBoard, moves, unused);

						moves.pop();
					}
				}
			}

			piece = rotate(piece);
		}

		unused.splice(i, 0, p);
	}
}

performance.mark("start");

dfs(createBoard(ROWS, COLS), [], [M.O, M.I, M.T, M.L, M.J, M.S, M.Z]);

const nonWorkingSequences = new Set<string>();
const workingSequencesArray = [...workingSequences.values()];

console.log(`WORKING SEQUENCES ${workingSequences.size}:`);
console.log([...workingSequences.values()].join("\n"));

for (let i = 1; i <= COLS; i++) {
	const a = workingSequencesArray.filter(w => w.length === i);
	console.log(`\nWORKING SEQUENCES; LENGTH ${i}; ${a.length}:`);
	console.log(a.join("\n"));
}

function dfsCols(xs: M[], unused: M[]) {
	if (xs.length === COLS) {
		const seq = xs.join("");

		if (!workingSequencesArray.some(w => seq.startsWith(w))) {
			nonWorkingSequences.add(seq);
		}

		return;
	}

	if (!unused.length) unused = secondBag;

	for (let i = 0; i < unused.length; i++) {
		const [x] = unused.splice(i, 1);
		xs.push(x);
		dfsCols(xs, unused);
		xs.pop();
		unused.splice(i, 0, x);
	}
}

dfsCols([], [M.O, M.I, M.T, M.L, M.J, M.S, M.Z]);

console.log(`\nNON WORKING SEQUENCES ${nonWorkingSequences.size}:`);
console.log([...nonWorkingSequences.values()].join("\n"));

performance.mark("end");

const measure = performance.measure("start to end", "start", "end");

console.log(`\nTook ${measure.duration}ms`);
