content #meditation searchType: tag  
searchTarget: meditation O frontmatter ---  
tags: meditation  
--- searchType: tag  
searchTarget: meditation O content #weight:60.5kg searchType: tag  
searchTarget: weight V content #finance/bank1/transfer:100USD searchType: tag  
searchTarget: finance/bank1/transfer V content #finance/bank1/transfer:100USD  
#finance/bank1/income:80USD  
#finance/bank1/outcome:-120USD searchType: tag  
searchTarget: finance/bank1 V content #blood-pressure:180/120 searchType: tag  
searchTarget: blood-pressure[0], blood-pressure[1] V content dvTarget:: 20.5 searchType: dvField  
searchTarget: dvTarget V content dvTarget:: 20.5/30.5 searchType: dvField  
searchTarget: dvTarget[0], dvTarget[1] V content dvTarget:: 20.5, 30.5 searchType: dvField  
searchTarget: dvTarget[0], dvTarget[1]  
separator: 'comma' V frontmatter ---  
mood: 10  
--- searchType: frontmatter  
searchTarget: mood V frontmatter ---  
bp: 184.4/118.8  
--- searchType: frontmatter  
searchTarget: bp[0], bp[1] V frontmatter ---  
bp: 184.4, 118.8  
--- searchType: frontmatter  
searchTarget: bp[0], bp[1]  
separator: 'comma' V frontmatter ---  
bp: [184.4, 118.8]  
--- searchType: frontmatter  
searchTarget: bp[0], bp[1] V frontmatter ---  
clock-in: 10:45  
clock-out: 20:51  
--- searchType: frontmatter  
searchTarget: clock-in, clock-out V content [[journal]] searchType: wiki  
searchTarget: journal O content ⭐ searchType: text  
searchTarget: ⭐ O content love searchType: text  
searchTarget: love O content [test@gmail.com](mailto:test@gmail.com)  
[test@hotmail.com](mailto:test@hotmail.com) searchType: text  
searchTarget: '.+\@.+\..+' O content #weightlifting: 50 searchType: text  
searchTarget: 'weightlifting: (?<value>[\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+)' V content I walked 10000 steps today. searchType: text  
searchTarget: 'walked\s+(?<value>[0-9]+)\s+steps' V content myvalues 1/2/3 searchType: text  
searchTarget: 'myvalues\s+(?<value>[0-9]+)/([0-9]+)/([0-9]+), myvalues\s+([0-9]+)/(?<value>[0-9]+)/([0-9]+), myvalues\s+([0-9]+)/([0-9]+)/(?<value>[0-9]+)' V table content { a table filled with dates and values }  
[example table](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/data/Tables.md) searchType: table  
searchTarget: filePath[0][0], filePath[0][1] V table content { a table filled with dates and values }  
[example table](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/data/Tables.md) searchType: table  
searchTarget: filePath[1][0], filePath[1][1][0], filePath[1][1][1] V file meta meta data from files  
(size, cDate, mDate, numWords, numChars, numSentences) searchType: fileMeta  
searchTarget: size V content - [x] Say love  
- [ ] Say love searchType:task  
searchTarget: Say love O content - [x] Say love searchType:task.done  
searchTarget: Say love O content - [ ] Say love searchType: task.notdone  
searchTarget: Say love O