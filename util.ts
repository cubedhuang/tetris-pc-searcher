export enum M {
	_ = " ",
	O = "O",
	I = "I",
	T = "T",
	L = "L",
	J = "J",
	S = "S",
	Z = "Z"
}

export type Board = M[][];

export type Move = {
	piece: M[][];
	row: number;
	col: number;
};

export const PIECES: Record<M, M[][]> = {
	[M._]: [[M._]],
	[M.O]: [
		[M.O, M.O],
		[M.O, M.O]
	],
	[M.I]: [[M.I, M.I, M.I, M.I]],
	[M.T]: [
		[M._, M.T, M._],
		[M.T, M.T, M.T]
	],
	[M.L]: [
		[M.L, M._],
		[M.L, M._],
		[M.L, M.L]
	],
	[M.J]: [
		[M._, M.J],
		[M._, M.J],
		[M.J, M.J]
	],
	[M.S]: [
		[M._, M.S, M.S],
		[M.S, M.S, M._]
	],
	[M.Z]: [
		[M.Z, M.Z, M._],
		[M._, M.Z, M.Z]
	]
};

export const ROTATION_COUNTS: Record<M, number> = {
	[M._]: 0,
	[M.O]: 1,
	[M.I]: 2,
	[M.T]: 4,
	[M.L]: 4,
	[M.J]: 4,
	[M.S]: 2,
	[M.Z]: 2
};

export const Ms = [M.O, M.I, M.T, M.L, M.J, M.S, M.Z];

export function pieceToM(piece: M[][]): M {
	return (
		piece.find(row => row.some(p => p !== M._))?.find(p => p !== M._) ?? M._
	);
}

export function movesToString(moves: Move[]) {
	return moves
		.map(({ piece, row, col }) => {
			const p = piece.map(row => row.join("")).join("\n");
			return `${p}\n(${row}, ${col})`;
		})
		.join("\n");
}

/**
 * access board[row][col]
 * board[0][0] is the bottom left corner
 */
export function createBoard(rows: number, cols: number): Board {
	return Array.from({ length: rows }, () =>
		Array.from({ length: cols }, () => M._)
	);
}

export function rotate(piece: M[][]): M[][] {
	const rotated: M[][] = [];

	for (let c = 0; c < piece[0].length; c++) {
		const row: M[] = [];
		for (let r = piece.length - 1; r >= 0; r--) {
			row.push(piece[r][c]);
		}
		rotated.push(row);
	}

	return rotated;
}

export function canPlacePiece(
	board: Board,
	{ piece, row, col }: Move,
	hardDrop = false
): boolean {
	// check space
	for (let r = 0; r < piece.length; r++) {
		for (let c = 0; c < piece[0].length; c++) {
			if (piece[r][c] !== M._ && board[row + r]?.[col + c] !== M._) {
				return false;
			}
		}
	}

	// check if there are any cells above the piece
	if (hardDrop) {
		for (let c = 0; c < piece[0].length; c++) {
			for (let r = 0; r < row + piece.length; r++) {
				if (piece[r - row] && piece[r - row][c] !== M._) break;
				if (board[r][col + c] !== M._) return false;
			}
		}
	}

	// if one of the cells below is not empty, then we can place the piece
	for (let r = 0; r < piece.length; r++) {
		for (let c = 0; c < piece[0].length; c++) {
			if (piece[r][c] !== M._ && board[row + r + 1]?.[col + c] !== M._) {
				return true;
			}
		}
	}

	return false;
}

export function placePiece(board: Board, { piece, row, col }: Move): void {
	for (let r = 0; r < piece.length; r++) {
		for (let c = 0; c < piece[0].length; c++) {
			if (piece[r][c] !== M._) board[row + r][col + c] = piece[r][c];
		}
	}
}

export function clearLines(board: Board): void {
	for (let r = 0; r < board.length; r++) {
		if (board[r].every(p => p !== M._)) {
			board.splice(r, 1);
			r--;
		}
	}
}
