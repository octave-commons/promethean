Debugging status preservation issue:

1. The formatCardLine function includes attrs via createCardText -> stringifyAttrs
2. The parser should read attrs from the card text before the HTML comment
3. But status is still not preserved - shows 'Todo' instead of 'In Progress'

Need to:
- Check if attrs are actually being written to markdown
- Verify parser is reading attrs correctly  
- Check move-task.ts is setting attrs.status properly