---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Refactor Markdown Stream Handling"
conversation_id: 5a03c37b-e904-43c3-86f0-eb7ef8eceb67
create_time: 07/22/2024 at 12:47 AM
update_time: 07/22/2024 at 12:47 AM
---

# Title: Refactor Markdown Stream Handling

Created: 07/22/2024 at 12:47 AM
Last Updated: 07/22/2024 at 12:47 AM
Chat URL: https://chat.openai.com/c/5a03c37b-e904-43c3-86f0-eb7ef8eceb67


>[!nexus_user] **User** - 07/22/2024 at 12:47 AM
> Refactor handle_chunk to split the stream on markdown blocks specifically preserving code blocks and splitting lists into their own chunks. be as fine grain as possible resulting in an array of short messages.
<!-- UID: aaa20f9d-07ce-4c68-b272-296014a9bf55 -->




>[!nexus_agent] **Assistant** - 07/22/2024 at 12:47 AM
> To refactor the `handle_chunk` function to split the stream on markdown blocks, preserving code blocks, and splitting lists into their own chunks, you can use a combination of regular expressions and string operations. Here’s a Python example of how you might achieve this:
> 
> ```python
> import re
> 
> def handle_chunk(stream):
>  # Define regex patterns for markdown elements
>  code_block_pattern = re.compile(r'(```[\s\S]*?```)', re.MULTILINE)
>  list_pattern = re.compile(r'(^\s*[-*]\s.+?$)', re.MULTILINE)
>  paragraph_pattern = re.compile(r'(\n{2,})')
>  
>  # First, split by code blocks
>  chunks = []
>  remaining_stream = stream
>  while True:
>  code_match = code_block_pattern.search(remaining_stream)
>  if not code_match:
>  break
>  # Append text before the code block
>  before_code = remaining_stream[:code_match.start()]
>  if before_code:
>  chunks.extend(re.split(paragraph_pattern, before_code))
>  # Append the code block itself
>  chunks.append(code_match.group())
>  # Update the remaining stream
>  remaining_stream = remaining_stream[code_match.end():]
>  
>  # Append any remaining text after the last code block
>  if remaining_stream:
>  chunks.extend(re.split(paragraph_pattern, remaining_stream))
>  
>  # Split lists into their own chunks
>  final_chunks = []
>  for chunk in chunks:
>  if list_pattern.search(chunk):
>  final_chunks.extend(list_pattern.split(chunk))
>  else:
>  final_chunks.append(chunk)
>  
>  # Remove any empty strings from the final list of chunks
>  final_chunks = [chunk.strip() for chunk in final_chunks if chunk.strip()]
>  
>  return final_chunks
> 
> # Example usage
> stream = """
> # Title
> 
> This is a paragraph with some text.
> 
> ```
> code block 1
> ```
> 
> - List item 1
> - List item 2
> 
> Another paragraph.
> 
> ```
> code block 2
> ```
> """
> 
> chunks = handle_chunk(stream)
> for i, chunk in enumerate(chunks):
>  print(f"Chunk {i+1}:\n{chunk}\n")
> ```
> 
> ### Explanation:
> 
> 1. **Define Regex Patterns**:
>  - `code_block_pattern`: Matches code blocks enclosed in triple backticks.
>  - `list_pattern`: Matches individual list items starting with `-` or `*`.
>  - `paragraph_pattern`: Matches two or more newlines, which typically separate paragraphs.
> 
> 2. **Initial Split by Code Blocks**:
>  - The stream is first split by code blocks, ensuring that code blocks are preserved as individual chunks.
> 
> 3. **Further Split by Paragraphs**:
>  - The text before each code block (and the remaining text after the last code block) is split by paragraphs.
> 
> 4. **Split Lists into Their Own Chunks**:
>  - Each chunk is further split by individual list items, ensuring that list items are their own chunks.
> 
> 5. **Clean Up**:
>  - Any empty strings resulting from the splits are removed.
> 
> 6. **Example Usage**:
>  - The `stream` is processed, and the resulting chunks are printed.
> 
> This approach ensures that the stream is split into as fine-grained chunks as possible while preserving the integrity of code blocks and splitting lists into individual items.
<!-- UID: c679f901-3399-485c-afa3-6cd057c48fba -->

---


