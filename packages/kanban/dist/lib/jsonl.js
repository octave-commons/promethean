export const printJSONL = (value) => {
    if (Array.isArray(value)) {
        for (const v of value) {
            process.stdout.write(JSON.stringify(v) + '\n');
        }
    }
    else {
        process.stdout.write(JSON.stringify(value) + '\n');
    }
};
//# sourceMappingURL=jsonl.js.map