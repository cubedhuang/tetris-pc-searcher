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
	placePiece,
	rotate
} from "./util.ts";

const ROWS = 4;
const COLS = 7;
const SEQ = "OITZJLS";

const solutions = new Set<string>();

function dfs(board: Board, moves: Move[], unused: M[]): void {
	clearLines(board);

	if (board.every(row => row.every(p => p === M._)) && moves.length) {
		const m = movesToString(moves);

		if (solutions.has(m)) return;

		console.log(m);

		solutions.add(m);

		return;
	}

	if (!unused.length) return;

	const p = unused.pop()!;
	let piece = PIECES[p];

	for (let i = 0; i < ROTATION_COUNTS[p]; i++) {
		for (let row = 0; row < ROWS; row++) {
			for (let col = 0; col < COLS; col++) {
				const move = { piece, row, col };

				if (canPlacePiece(board, move)) {
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

	unused.push(p);

	return;
}

dfs(createBoard(ROWS, COLS), [], SEQ.split("").reverse() as M[]);

console.log(solutions.size);

console.log([...solutions.values()].join("\n\n"));
