import { spawn } from "node:child_process";
import { buffer } from "node:stream/consumers";
import { resolve as resolvePath } from "node:path";
import { z } from "zod";
import { getMcpRoot } from "../files.js";
const isUniversalDiff = (value) => /^(?:Index: |diff --git|---\s)/m.test(value);
class GitApplyError extends Error {
    code;
    stdout;
    stderr;
    attemptedThreeWay;
    constructor(message, code, init) {
        super(message);
        this.name = "GitApplyError";
        this.code = code;
        this.stdout = init.stdout;
        this.stderr = init.stderr;
        this.attemptedThreeWay = init.attemptedThreeWay ?? false;
    }
}
const joinOutputs = (...parts) => parts
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join("\n");
const createGitArgs = (check, threeWay) => [
    "apply",
    "--whitespace=nowarn",
    ...(threeWay ? ["--3way"] : []),
    ...(check ? ["--check"] : []),
];
const runGitApplyAttempt = async (diff, options, threeWay) => {
    const child = spawn("git", createGitArgs(options.check, threeWay), {
        cwd: options.cwd,
        stdio: ["pipe", "pipe", "pipe"],
    });
    const exitCodePromise = new Promise((resolve, reject) => {
        child.once("error", reject);
        child.once("close", resolve);
    });
    const stdoutPromise = buffer(child.stdout).then((buf) => buf.toString("utf8"));
    const stderrPromise = buffer(child.stderr).then((buf) => buf.toString("utf8"));
    child.stdin.end(diff, "utf8");
    const [code, stdout, stderr] = await Promise.all([
        exitCodePromise,
        stdoutPromise,
        stderrPromise,
    ]);
    if (code === 0) {
        return { stdout, stderr };
    }
    throw new GitApplyError("git apply failed", code, {
        stdout,
        stderr,
        attemptedThreeWay: threeWay,
    });
};
const runGitApply = (diff, options) => runGitApplyAttempt(diff, options, false).catch((error) => {
    if (!(error instanceof GitApplyError)) {
        throw error;
    }
    return runGitApplyAttempt(diff, options, true).catch((fallbackError) => {
        if (fallbackError instanceof GitApplyError) {
            throw new GitApplyError("git apply failed after attempting 3-way merge", fallbackError.code, {
                stdout: joinOutputs(error.stdout, fallbackError.stdout),
                stderr: joinOutputs(error.stderr, fallbackError.stderr, "git apply --3way also failed"),
                attemptedThreeWay: true,
            });
        }
        throw fallbackError;
    });
});
export const applyPatchTool = (ctx) => {
    const shape = {
        diff: z.string().min(1, "diff is required"),
        check: z.boolean().default(false),
    };
    const Schema = z.object(shape);
    const spec = {
        name: "apply_patch",
        description: "Apply a universal diff patch to the MCP sandbox using git apply.",
        inputSchema: Schema.shape,
        examples: [
            {
                comment: "Dry-run a single-file change before applying",
                args: {
                    diff: [
                        "diff --git a/README.md b/README.md",
                        "--- a/README.md",
                        "+++ b/README.md",
                        "@@",
                        "-Old heading",
                        "+New heading",
                        "",
                    ].join("\n"),
                    check: true,
                },
            },
        ],
        stability: "stable",
        since: "0.1.0",
    };
    const invoke = async (raw) => {
        const argsParsed = Schema.parse(raw);
        const { diff, check } = argsParsed;
        if (!isUniversalDiff(diff)) {
            throw new Error("Input does not look like a universal diff");
        }
        const cwd = ctx.env.MCP_ROOT_PATH
            ? resolvePath(ctx.env.MCP_ROOT_PATH)
            : getMcpRoot();
        const onSuccess = (result) => ({
            ok: true,
            stdout: result.stdout.trim(),
            stderr: result.stderr.trim(),
            check,
        });
        const onFailure = (error) => {
            if (error instanceof GitApplyError) {
                const tail = [error.stdout.trim(), error.stderr.trim()]
                    .filter((part) => part.length > 0)
                    .join("\n");
                const details = tail.length > 0 ? `: ${tail}` : "";
                throw new Error(`git apply exited with code ${error.code ?? "unknown"}${details}`);
            }
            throw error;
        };
        return runGitApply(diff, { cwd, check }).then(onSuccess, onFailure);
    };
    return { spec, invoke };
};
//# sourceMappingURL=apply-patch.js.map