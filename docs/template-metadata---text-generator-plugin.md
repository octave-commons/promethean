The Template File Metadata is a crucial component of any template in Text Generator. It serves as the header information that provides essential details about the template itself. Properly documenting this metadata ensures clarity, usability, and consistency in your template management. This documentation will guide you through the various fields within the Template File Metadata and how to use them effectively.

|Field|Type|Purpose|Example|
|---|---|---|---|
|`promptId`|String|Unique identifier for each prompt. Must match the name of the template file.||
|`name`|String|Concise and descriptive name for the prompt.||
|`description`|String|Explains the purpose of the prompt.||
|`author`|String|Attributes the prompt to its creator.||
|`required_values`|Array of Strings|Lists values necessary for template function.||
|`tags`|Array of Strings|Relevant keywords for filtering prompts.||
|`version`|String (Semantic Versioning)|Indicates prompt version.||
|`commands`|Array of Strings|Specifies actions associated with the template.|`generate`, `insert&create`|
|`mode`|String|Specifies the desired mode for completions.|`insert`, `replace`|
|`system and messages`|Object|Configures system behavior and define messages.||
|`max_tokens`|Number|Maximum tokens considered in completion.||
|`temperature`|Number|Indicates randomness of model output.||
|`stream`|Boolean|Controls streaming mode operation.|`true`, `false`|
|`provider`|String|Service/platform used for processing.|"openAIChat", "ollama"|
|`model`|String|Name of the model for selected provider.||
|`disableProvider`|Boolean|Allows disabling of template execution (disabled by default).|`true`, `false`|
|`endpoint`|String|Specific endpoint for template use.||
|`output`|String|Path to retrieve result from response.|`![]({{requestResults.data.0.url}})`|
|`body`|String \| Object|Data for the API request.|`{"n": 1, "prompt": "{{escp prompt}}"}`|
|`headers`|String \| Object|Sends additional request metadata.|`{"Authorization": "Bearer {{keys.hf}}"}`|
|`chain.loader`|String|Loader function to initialize chain process.|`loadSummarizationChain`|
|`chain.type`|"map_reduce" \| "refine" \| "staff"|Type of langchain chains to utilize.||
|`chain.verbose`|Boolean|Provides detailed logging for chain process.||
|`splitter.chunkSize`|Number|Size of each chunk for input data splitting.||
|`splitter.chunkOverlap`|Number|Overlapping elements between consecutive chunks.||
|`strict`|Boolean|Forces the user to fill all the Variables before running the template.||
|`viewTypes`|Array of Strings|Tells Obsidan what files are supported (markdown, excalidraw, canvas)||

To create a professional and clear Template File Metadata, follow these best practices: