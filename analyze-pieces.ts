import { M } from "./util.ts";

const LENGTH = Number(Deno.args[0] ?? "0") || 0;

if (LENGTH < 4 || LENGTH > 8) {
	console.error("Invalid length");
	Deno.exit(1);
}

function readFileNormalized(path: string): string {
	return Deno.readTextFileSync(path)
		.replaceAll("\r", "")
		.replaceAll("\u0000", "");
}

const rawTextLenient = readFileNormalized(`${LENGTH}-wide-lenient.txt`);
const rawTextHarddrop = readFileNormalized(`${LENGTH}-wide-harddrop.txt`);

type Data = {
	exactWorkingSequences: string[];
	totalWorkingSequences: string[];
	nonWorkingSequences: string[];
};

function parseRawText(text: string): Data {
	const nonWorkingSequences = /NON WORKING SEQUENCES \d+:\n([\s\S]+?)\n\n/
		.exec(text)![1]
		.split("\n")
		.filter(s => s);
	const exactWorkingSequences = /WORKING SEQUENCES \d+:\n([\s\S]+?)\n\n/
		.exec(text)![1]
		.split("\n")
		.filter(s => s);

	const length = nonWorkingSequences[0].length;

	const totalWorkingSequences: string[] = [];

	const bag = [M.O, M.I, M.T, M.L, M.J, M.S, M.Z];
	const secondBag = [...bag];

	function permute(xs: M[], unused: M[]) {
		if (xs.length === length) {
			const seq = xs.join("");

			if (!nonWorkingSequences.includes(seq)) {
				totalWorkingSequences.push(seq);
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

	return {
		exactWorkingSequences,
		totalWorkingSequences,
		nonWorkingSequences
	};
}

function normalizeRecord(
	record: Record<string, number>
): Record<string, number> {
	record = sortRecord(record);

	const total = Object.values(record).reduce((a, b) => a + b, 0);

	for (const m in record) {
		record[m] /= total;
	}

	return record;
}

function sortRecord(record: Record<string, number>): Record<string, number> {
	return Object.fromEntries(
		Object.entries(record).sort((a, b) => b[1] - a[1])
	);
}

function getTotalPossibilities(length: number): number {
	let value = 1;
	let multiplier = 7;

	for (let i = 0; i < length; i++) {
		value *= multiplier--;

		if (multiplier === 0) multiplier = 7;
	}

	return value;
}

function getAppearanceCounts(data: Data): Record<string, number> {
	const appearances: Record<string, number> = {};

	for (const seq of data.totalWorkingSequences) {
		for (const m of seq) {
			appearances[m] ??= 0;
			appearances[m]++;
		}
	}

	return appearances;
}

function getStartingCounts(data: Data): Record<string, number> {
	const starts: Record<string, number> = {};

	for (const seq of data.totalWorkingSequences) {
		const m = seq[0];
		starts[m] ??= 0;
		starts[m]++;
	}

	return starts;
}

function getEndingCounts(data: Data): Record<string, number> {
	const ends: Record<string, number> = {};

	for (const seq of data.exactWorkingSequences) {
		const m = seq[seq.length - 1];
		ends[m] ??= 0;
		ends[m]++;
	}

	return ends;
}

function logRecord(record: Record<string, number>) {
	for (const m in record) {
		console.log(`${m}:`, record[m]);
	}
}

const totalPossibilities = getTotalPossibilities(LENGTH);

const lenientData = parseRawText(rawTextLenient);
const lenientAppearanceCounts = normalizeRecord(
	getAppearanceCounts(lenientData)
);
const lenientStartingCounts = normalizeRecord(getStartingCounts(lenientData));
const lenientEndingCounts = normalizeRecord(getEndingCounts(lenientData));

const harddropData = parseRawText(rawTextHarddrop);
const harddropAppearanceCounts = normalizeRecord(
	getAppearanceCounts(harddropData)
);
const harddropStartingCounts = normalizeRecord(getStartingCounts(harddropData));
const harddropEndingCounts = normalizeRecord(getEndingCounts(harddropData));

console.log("\n-----\nupper bound simulation (placing anywhere)\n-----");
console.log(
	"pc probability for random sequence:",
	lenientData.totalWorkingSequences.length / totalPossibilities
);
console.log("piece frequency:");
logRecord(lenientAppearanceCounts);
console.log("starting piece frequency:");
logRecord(lenientStartingCounts);
console.log("ending piece frequency:");
logRecord(lenientEndingCounts);

console.log("\n-----\nlower bound simulation (hard drop only)\n-----");
console.log(
	"pc probability for random sequence:",
	harddropData.totalWorkingSequences.length / totalPossibilities
);
console.log("piece frequency:");
logRecord(harddropAppearanceCounts);
console.log("starting piece frequency:");
logRecord(harddropStartingCounts);
console.log("ending piece frequency:");
logRecord(harddropEndingCounts);
