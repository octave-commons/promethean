## 🛠️ Description

Too many lambda functions used in a code base is a smelll. You're describing isolated reused logic without naming it, the deeper a closure tree goes the less clear what variables are coming from where. 

The simplest way to fix this is to pull them all out, rename them Then  identify the variables it was using from it's surrounding scope. Then write a high order function that accepts those values, and return the function. And bam, and a monad was born.

---

## 🎯 Goals

- What are we trying to accomplish?

---

## 📦 Requirements

- [ ] Detail requirements.

---

## 📋 Subtasks

- [ ] Outline steps to implement.

---

## 🔗 Related Epics

#framework-core

---

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

Nothing

---

## 🔍 Relevant Links

- [[kanban.md]]