var docs = sibilant.docs = {
  definitions: [],
  undocumented: {  }
};
docs.record = (function docs$record$(type, namespace, name, node) {
  /* docs.record src/docs.sibilant:4:0 */

  var doc = docs.lastDoc;
  (function() {
    if (typeof doc !== "undefined") {
      delete sibilant.docs.undocumented[name];
      return sibilant.docs.definitions.push(mergeInto(doc, {
        name: name,
        type: type,
        namespace: namespace,
        definition: node
      }));
    } else {
      return sibilant.docs.undocumented[name] = true;
    }
  }).call(this);
  return delete sibilant.docs.lastDoc;
});
docs.tags = (function docs$tags$() {
  /* docs.tags src/docs.sibilant:16:0 */

  var tags = flatten(pluck(docs.definitions, "tags")),
      counts = {  };
  tags.forEach((function(tag) {
    /* src/docs.sibilant:19:5 */
  
    return counts[tag] = ((counts[tag] || 0) + 1);
  }));
  return counts;
});
docs.text = (function docs$text$() {
  /* docs.text src/docs.sibilant:27:0 */

  return docs.definitions.sort((function(a, b) {
    /* src/docs.sibilant:29:16 */
  
    return prettify(a.name, false).localeCompare(prettify(b.name, false));
  })).map((function(definition) {
    /* src/docs.sibilant:34:15 */
  
    return ("name: " + definition.type + " " + definition.namespace + "/" + prettify(definition.name) + "\n" + "description: " + definition.docString + "\n" + (function() {
      if (definition.references) {
        return ("references:\n  " + (definition.references.map((function() {
          /* src/docs.sibilant:40:51 */
        
          return eval(outputFormatter(transpile(arguments[0])));
        })).join("\n  ") + "\n"));
      } else {
        return "";
      }
    }).call(this) + (function() {
      if (definition.tags) {
        return ("tags: " + definition.tags.join(", ") + "\n");
      } else {
        return "";
      }
    }).call(this) + "arguments: " + prettify(definition.definition.contents[2]) + "\n" + "examples: \n" + (definition.examples || []).map((function() {
      /* src/docs.sibilant:51:43 */
    
      return (prettify(arguments[0], true) + "\n" + outputFormatter(transpile(arguments[0])));
    })).join("\n\n") + "\n\n");
  })).join("");
});
docs.textNoColor = (function docs$textNoColor$() {
  /* docs.text-no-color src/docs.sibilant:58:0 */

  var stripAnsi = require("strip-ansi");
  return stripAnsi(docs.text());
});
docs.json = (function docs$json$() {
  /* docs.json src/docs.sibilant:63:0 */

  return JSON.stringify(docs.data());
});
docs.data = (function docs$data$() {
  /* docs.data src/docs.sibilant:66:0 */

  return docs.definitions.map((function(definition) {
    /* src/docs.sibilant:68:6 */
  
    return {
      name: prettify(definition.name, false),
      namespace: definition.namespace,
      type: definition.type,
      description: definition.docString,
      references: (function() {
        if (definition.references) {
          return definition.references.map((function() {
            /* src/docs.sibilant:74:52 */
          
            return arguments[0].token.slice(1, -1);
          }));
        } else {
          return [];
        }
      }).call(this),
      arguments: definition.definition.contents[2].contents.map((function() {
        /* src/docs.sibilant:79:30 */
      
        return prettify(arguments[0], false);
      })),
      definition: prettify(definition.definition, false),
      examples: (definition.examples || []).map((function() {
        /* src/docs.sibilant:82:29 */
      
        return {
          javascript: outputFormatter(transpile(arguments[0])),
          sibilant: prettify(arguments[0], false)
        };
      })),
      tags: definition.tags
    };
  }));
});