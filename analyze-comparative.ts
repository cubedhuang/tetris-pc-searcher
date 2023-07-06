function readFileNormalized(path: string): string {
	return Deno.readTextFileSync(path)
		.replaceAll("\r", "")
		.replaceAll("\u0000", "");
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

function calculatePcProbability(text: string): number {
	const nonWorkingSequences = /NON WORKING SEQUENCES \d+:\n([\s\S]+?)\n\n/
		.exec(text)![1]
		.split("\n")
		.filter(s => s);

	return (
		1 -
		nonWorkingSequences.length /
			getTotalPossibilities(nonWorkingSequences[0].length)
	);
}

for (let i = 4; i <= 8; i++) {
	const rawTextLenient = readFileNormalized(`${i}-wide-lenient.txt`);
	const rawTextHarddrop = readFileNormalized(`${i}-wide-harddrop.txt`);

	const pcProbabilityLenient = calculatePcProbability(rawTextLenient);
	const pcProbabilityHarddrop = calculatePcProbability(rawTextHarddrop);

	console.log(
		`width ${i}:`,
		pcProbabilityHarddrop,
		"< p <",
		pcProbabilityLenient
	);
}
