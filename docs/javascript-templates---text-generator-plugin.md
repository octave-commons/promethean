This document provides detailed information on the use of the `script` within a templating engine. To execute these scripts, you must enable script execution in your settings.

## Warning

Executing unverified scripts can be extremely hazardous. Always ensure that the scripts you are running come from a trusted source to avoid security risks.

## Example Usage

Here is an example of how to **utilize** the script within a template:

```
// make sure to mention the variables used so that text-generator adds them to the available context
// like so {{tg_selection}} {{test}}

{{#script}}
	// Run any JavaScript code here.
	// Any returned value will be where the script tag is at.
	// Access context variables with the 'this' keyword.
	// Example: this.selection, this.title, etc.
	// You can change or add a variable and use it in the context.
	// Example:
	this.test = "hello world";
	return "return hello world";
{{/script}}

{{test}}
```

**output**

```
return hello world
hello world
```

## Contexts for Script Execution

The following contexts are available for running scripts within the template:

### App Context

**Run JavaScript** to interact with the app's current state of obsidian. For example:

```
{{#script}}
// This will **return** the creation date of the active note
return new Date(app.workspace.getActiveFile().stat.ctime);
{{/script}}
```

### Plugin Context

**Fetch** Text generator plugin-related data using JavaScript. Here's an example:

```
{{#script}}
// This will **return** the version of Text Generator
return plugin.manifest.version
{{/script}}
```

### PluginApi Context

**Interact** with specific plugins installed in your environment. Ensure you have the required plugin for the following code snippet:

```
{{#script}}
const tts = pluginApi('tts');
await tts.say("This is a test"); // Language is optional, use an ISO 639-1 code
{{/script}}
```

### 'This' Context

**Access and manipulate** the current template context:

```
{{#script}}
	this.highlights.push("this is a new highlight");
{{/script}}

{{highlights}}
```

### Langchain (Partial)

**Split text** into manageable parts for processing. More information on splitters can be found [here](https://js.langchain.com/docs/modules/data_connection/document_transformers/):

```
{{#script}}
	const youtubeScript = await extract("yt", "https://www.youtube.com/watch?v=tNAsLbGdM6A");
	
	const splitter = new RecursiveCharacterTextSplitter({
	  chunkSize: 4000,
	  chunkOverlap: 1,
	});
	
	const output = await splitter.createDocuments([youtubeScript]);
	
	return output.join("***/n");
{{/script}}
```

## Function Helpers within Scripts

The following function helpers can be used within scripts to **perform actions** such as extraction, running other templates, generating content, writing to files, and displaying notices or errors.

### Extract Helper Function

**Extract content** from specified sources, more information can be found [extract helper function](https://docs.text-gen.com/_notes/3-+Templates/subpages/extract+helper+function):

```
{{#script}}
	const youtubeScript = await extract("youtube", "https://www.youtube.com/watch?v=tNAsLbGdM6A");
	return youtubeScript;
{{/script}}
```

### Run Helper Function

**Run** an existing template in the code, more information can be found [run helper function](https://docs.text-gen.com/_notes/3-+Templates/subpages/run+helper+function):

```
{{#script}}
	const youtubeScript = await extract("youtube", "https://www.youtube.com/watch?v=tNAsLbGdM6A");
	
	const summary = await run("default/summary", {tg_selection: youtubeScript});
	
	return summary;
{{/script}}
```

### Generate Template Content

**Use generate** to run a prompt template directly from the code:

```
{{#script}}
	const youtubeScript = await extract("youtube", "https://www.youtube.com/watch?v=tNAsLbGdM6A");
	
	const truncatedString = youtubeScript.length > 1000 ? youtubeScript.substring(0, 1000) : youtubeScript;
	
	const summary = await gen(`summarize the following content : {{content}}
Summary:
`,
	{ content: truncatedString });
	
	return summary;
{{/script}}
```

### Generate Template Content (JSON response)

**Use generate** to run a prompt template directly from the code:

```
{{#script}}
	const countings = await genJSON(
		`Give me a JSON Record Object counting from 1 to 5 Key is name of the number, and value is the number`, 
		{ max_tokens: 200 }
	);
	
	return JSON.stringify(countings);
{{/script}}
```

> - The prompt needs to contain the word `JSON`
> - This tool only works with OpenAI, (it could work with other providers but highly unlikely).

### Write to File

**Write content** to a file in your system it will create the path if it does not exist:

```
{{#script}}
	const youtubeScript = await extract("youtube", "https://www.youtube.com/watch?v=tNAsLbGdM6A");
	const summary = await run("default/summary", {tg_selection: youtubeScript});
	
	await write("summary.md", summary);
	return summary;
{{/script}}
```

### Append to File

**Append content** to an existing file and then **read** from it:

```
{{#script}}
	await append("summary.md", summary);
	return read("summary.md");
{{/script}}
```

### Read from File

**Read content** from a specified file:

```
{{#script}}
	const text = read("summary.md");
	return text;
{{/script}}
```

### Display Notice

**Show a notice** to the user:

```
{{#script}}
	notice("this is a notice");
{{/script}}
```

### Trigger Error

**Display an error** message:

```
{{#script}}
	error("this is an error");
{{/script}}
```

### `JSON5` Instead of `JSON`

Use this instead of `JSON` for parsing `JSON` code,  
its alot more lenient and forgiving when it comes to the `JSON` format

```
{{#script}}
	const Object = JSON5.parse(`
		{
			a: c,
			"b": "d",
		}
	`)
{{/script}}
```