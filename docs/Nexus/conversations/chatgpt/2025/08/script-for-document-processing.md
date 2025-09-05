---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Script for document processing"
conversation_id: 68b4971a-682c-8333-9b91-e81d79280689
create_time: 08/31/2025 at 1:40 PM
update_time: 08/31/2025 at 1:50 PM
---

# Title: Script for document processing

Created: 08/31/2025 at 1:40 PM
Last Updated: 08/31/2025 at 1:50 PM
Chat URL: https://chat.openai.com/c/68b4971a-682c-8333-9b91-e81d79280689


>[!nexus_user] **User** - 08/31/2025 at 1:40 PM
> Give me a simple typescript I can run over my docs/unique directory that reads the contents of every file, and uses ollama to generate a title, and front matter with the properties "title" "uuid" "description" "tags" "related to" "created at"
> 
> ## step 1
> Extract any existing frontmatter from each document.
> 
> If they contain the "filename" "description" and "tags" properties, skip them for this step.
> If the front matter does not contain "uuid", 
> generate a uuid, use the original name as the created at property for each document.
> 
> Request a json object from ollama with the properties "filename" "description" "tags". Validate the content of the json object with zod. For any missing properties, rerun the request excluding all previously generated properties from the schema, until the full schema has been generated.
> 
> # Step 2
> 
> Now use a language structure aware tokenizer to chunk each document up and add them to an in memory chroma instance with each of the current frontmatter objects as metadata, plus line and column numbers.
> 
> Cache the chunks, line/column numbers, embeddings
> 
> # Step 3 
> 
> Using the in memory chroma store, and the cached chunks/embeddings, iterate through each chunk and query the chroma store.
> 
> Cache the query results
> 
> # Step 4
> 
> Using the cached queries from chroma, generate an overall similarity score for each document to each other document.
> 
> For documents that meet a threshold (an argument to the script), add their uuids and titles to the frontmatter as "related to (title)" and "related to (uuid)"
> 
> # Step 5
<!-- UID: d84530bb-1879-4ff8-b7e7-c22d185da52a -->




>[!nexus_user] **User** - 08/31/2025 at 1:49 PM
> Give me a simple typescript I can run over my docs/unique directory that reads the contents of every file, and uses ollama to generate a title, and front matter
> 
> ## step 1
> Extract any existing frontmatter from each document.
> 
> If they contain the "filename" "description" and "tags" properties, skip them for this step, add it to the cache.
> If the front matter does not contain "uuid", 
> generate a uuid, use the original name as the created at property for each document.
> 
> Request a json object from ollama with the properties "filename" "description" "tags". Validate the content of the json object with zod. For any missing properties, rerun the request excluding all previously generated properties from the schema, until the full schema has been generated.
> 
> # Step 2
> 
> Now use a language structure aware tokenizer to chunk each document up and add them to an in memory chroma instance with each of the current frontmatter objects as metadata, plus line and column numbers.
> 
> Cache the chunks, line/column numbers, embeddings
> 
> # Step 3 
> 
> Using the in memory chroma store, and the cached chunks/embeddings, iterate through each chunk and query the chroma store.
> 
> Cache the query results
> 
> # Step 4
> 
> Using the cached queries from chroma, generate an overall similarity score for each document to each other document.
> 
> For documents that meet a threshold (an argument to the script), add their uuids and titles to the frontmatter as "related to (title)" and "related to (uuid)"
> 
> # Step 5
> 
> for each cached query result, for any item scoring higher than a configurable threshold, add it to a list of references in the front matter with uuid, line, col
> 
> # Step 6
> 
> Add/update the frontmatter of each document
> 
> # Step 7
> 
> For each related document, add them to the footer under "Related content"
> 
> # Step 8
> 
> for each reference add it to a list of source in the footer
> 
> # Step 9 
> 
> Write the changes and rename the file.
<!-- UID: 79e0953f-ed31-4bf2-9da6-99df74c0bd31 -->


