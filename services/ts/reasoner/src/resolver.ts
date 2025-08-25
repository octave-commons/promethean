export function resolveError(error: string): string {
    if (error.includes('ENOENT')) {
        return 'Check if the file path is correct and the file exists.';
    }
    if (error.includes('ECONNREFUSED')) {
        return 'Ensure the target service is running and reachable.';
    }
    if (error.includes('TypeError')) {
        return 'Verify that the types of your variables and function parameters are correct.';
    }
    return 'No resolution found. Escalate to developers.';
}
