// higher order function that runs `f` on all permutations
export function permute<T>(xs: T[], f: (xs: T[]) => void) {
	// use a depth-first search to generate all permutations

	dfs(f, [], xs);
}

// depth-first search: `ns` is the current ordering, `left` is unused values
function dfs<T>(f: (xs: T[]) => void, xs: T[], left: T[]) {
	if (left.length === 0) {
		f(xs);

		return;
	}

	for (let i = 0; i < left.length; i++) {
		// get the item from the position and remove it from `left`
		const [n] = left.splice(i, 1);

		// modify `ns`
		xs.push(n);

		// recurse
		dfs(f, xs, left);

		// revert changes to `ns` and `left`
		xs.pop();
		left.splice(i, 0, n);
	}
}
