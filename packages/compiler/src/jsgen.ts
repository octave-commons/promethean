import type { Expr, Name } from "./ast";

// Escape unsafe characters for JS string literal contexts
const charMap: Record<string, string> = {
	"<": "\\u003C",
	">": "\\u003E",
	"/": "\\u002F",
	"\u2028": "\\u2028",
	"\u2029": "\\u2029",
};
function escapeUnsafeChars(str: string): string {
	return str.replace(/[<>/\u2028\u2029]/g, (x) => charMap[x] || x);
}

interface Options {
	iife: boolean;
	importNames: string[];
	pretty: boolean;
}

export function emitJS(expr: Expr, opts: Options): string {
	const body = emitExpr(expr);
	const ident = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
	const imports = opts.importNames.filter((n) => ident.test(n));
	const header = imports.length
		? imports.map((n) => `const ${n}=args[${JSON.stringify(n)}];`).join("")
		: "";
	return `(function(args){${header}return ${body};})`;
}

function emitExpr(e: Expr): string {
	switch (e.kind) {
		case "Num":
			return String(e.value);
		case "Str":
			return escapeUnsafeChars(JSON.stringify(e.value));
		case "Bool":
			return e.value ? "true" : "false";
		case "Null":
			return "null";
		case "Var":
			return e.name.text;
		case "If":
			return `(${emitExpr(e.cond)}?${emitExpr(e.then)}:${emitExpr(e.else)})`;
		case "Block": {
			const exprs = e.exprs.map(emitExpr);
			const last = exprs.pop() ?? "null";
			const stmts = exprs.join(";");
			return `(function(){${stmts}${stmts ? ";" : ""}return ${last};})()`;
		}
		case "Let":
			return `(function(){const ${e.name.text}=${emitExpr(e.value)};return ${emitExpr(e.body)};})()`;
		case "Fun":
			return `(${e.params.map((p: Name) => p.text).join(",")}=>${emitExpr(e.body)})`;
		case "Def":
			return `function ${e.name.text}(${e.params.map((p: Name) => p.text).join(",")}){return ${emitExpr(e.body)};}`;
		case "Bin":
			return `(${emitExpr(e.left)} ${e.op} ${emitExpr(e.right)})`;
		case "Un": {
			const needsSpace = /^[A-Za-z]/.test(e.op);
			return `(${e.op}${needsSpace ? " " : ""}${emitExpr(e.expr)})`;
		}
		case "Call":
			return `${emitExpr(e.callee)}(${e.args.map(emitExpr).join(",")})`;
		case "Class": {
			const ctorParams = e.fields.map((f: Name) => f.text).join(",");
			const fieldAssign = e.fields
				.map((f: Name) => `this.${f.text}=${f.text};`)
				.join("");
			const methods = e.methods
				.map(
					(m: { name: Name; params: Name[]; body: Expr }) =>
						`${m.name.text}(${m.params.map((p: Name) => p.text).join(",")}){return ${emitExpr(m.body)};}`,
				)
				.join("");
			return `(class ${e.name.text}{constructor(${ctorParams}){${fieldAssign}}${methods}})`;
		}
		case "New":
			return `(new ${emitExpr(e.ctor)}(${e.args.map(emitExpr).join(",")}))`;
		case "Get":
			return `(${emitExpr(e.obj)}${emitProp(e.prop)})`;
		case "Set":
			return `(${emitExpr(e.obj)}${emitProp(e.prop)}=${emitExpr(e.value)})`;
		case "MethodCall":
			return `${emitExpr(e.obj)}${emitProp(e.method)}(${e.args.map(emitExpr).join(",")})`;
		default:
			return assertNever(e as never);
	}
}

function emitProp(prop: string | Name): string {
	const name = typeof prop === "string" ? prop : prop.text;
	return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)
		? `.${name}`
		: `[${JSON.stringify(name)}]`;
}

function assertNever(x: never): never {
	throw new Error(`Unhandled expression kind: ${JSON.stringify(x)}`);
}
