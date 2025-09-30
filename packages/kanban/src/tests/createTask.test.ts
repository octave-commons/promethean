import test from "ava";
test.todo("A task is created from the provided template");
test.todo("when no template is provided, a default template is used");
test.todo(
  "The template's body section is populated with the provided text in the newly created task",
);
test.todo(
  "A task's blocked by section contains wikilinks to the tasks that it is blocked by",
);
test.todo(
  "A task's blocking section contains wikilinks to the tasks that it blocks",
);
test.todo(
  "When a task is created with a blocking section, the blocked task's blocked by section is also updated",
);
test.todo(
  "When a task is created with a blocked by section, the blocking task's blocking section is also updated",
);
