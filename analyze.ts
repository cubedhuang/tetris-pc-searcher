import { M } from "./util.ts";

const rawText = (await Deno.readTextFile("4-wide-harddrop.txt"))
	.replaceAll("\r\n", "\n")
	.replaceAll("\r", "\n")
	.replaceAll("\u0000", "");

type Data = {
	workingSequences: string[];
	nonWorkingSequences: string[];
};

function parseRawText(text: string): Data {
	const re = /NON WORKING SEQUENCES \d+:\n([\s\S]+)\n\n/;

	const nonWorkingSequences = re
		.exec(text)![1]
		.split("\n")
		.filter(s => s);
	const length = nonWorkingSequences[0].length;
	const workingSequences: string[] = [];

	const bag = [M.O, M.I, M.T, M.L, M.J, M.S, M.Z];
	const secondBag = [...bag];

	function permute(xs: M[], unused: M[]) {
		if (xs.length === length) {
			const seq = xs.join("");

			if (!nonWorkingSequences.includes(seq)) {
				workingSequences.push(seq);
			}

			return;
		}

		if (!unused.length) unused = secondBag;

		for (let i = 0; i < unused.length; i++) {
			const [x] = unused.splice(i, 1);
			xs.push(x);
			permute(xs, unused);
			xs.pop();
			unused.splice(i, 0, x);
		}
	}

	permute([], [M.O, M.I, M.T, M.L, M.J, M.S, M.Z]);

	return { workingSequences, nonWorkingSequences };
}

function normalizeRecord(
	record: Record<string, number>
): Record<string, number> {
	record = sortRecord(record);

	const max = Object.values(record).reduce((a, b) => Math.max(a, b), 0);

	for (const m in record) {
		record[m] /= max;
	}

	return record;
}

function sortRecord(record: Record<string, number>): Record<string, number> {
	return Object.fromEntries(
		Object.entries(record).sort((a, b) => b[1] - a[1])
	);
}

function getAppearanceCounts(data: Data): Record<string, number> {
	const appearances: Record<string, number> = {};

	for (const seq of data.workingSequences) {
		for (const m of seq) {
			appearances[m] ??= 0;
			appearances[m]++;
		}
	}

	return appearances;
}

function getStartingCounts(data: Data): Record<string, number> {
	const starts: Record<string, number> = {};

	for (const seq of data.workingSequences) {
		const m = seq[0];
		starts[m] ??= 0;
		starts[m]++;
	}

	return starts;
}

function getEndingCounts(data: Data): Record<string, number> {
	const ends: Record<string, number> = {};

	for (const seq of data.workingSequences) {
		const m = seq[seq.length - 1];
		ends[m] ??= 0;
		ends[m]++;
	}

	return ends;
}

const data = parseRawText(rawText);

console.log("appearance counts", normalizeRecord(getAppearanceCounts(data)));
console.log("starting counts", normalizeRecord(getStartingCounts(data)));
console.log("ending counts", normalizeRecord(getEndingCounts(data)));
