## 🛠️ Task: Project Setup & Service Lifecycle Commands

We need a simple, consistent way to **initialize, run, stop, and clean up** all project services.  
It does not have to be a Makefile, but if that's the easiest and cleanest solution, we should use it.

---

## 🎯 Goals

- Provide commands to **bootstrap the entire project**
- Support **individual control** over each service
- Enable **full teardown/reset** of the environment
- Keep the solution compatible with the Promethean project structure

---

## 📦 Requirements

- ✅ `setup`: Initializes all services (e.g. installs deps, builds artifacts)
- ✅ `start`: Starts all services
- ✅ `stop`: Stops all services
- ✅ `start:<service>`: Starts a single service
- ✅ `stop:<service>`: Stops a single service
- ✅ `clean`: Resets/removes all build artifacts and state
- ✅ `clean:<service>`: Cleans up an individual service
- ✅ Works with **PM2**, but future-proofed for a custom process manager

---

## 📋 Subtasks

- [ ] Decide between Makefile, JS script, or shell script (or hybrid)
- [ ] Enumerate all current services in `services/`
- [ ] Write generalized lifecycle functions (e.g. `start_service(name)`)
- [ ] Implement `setup` logic per-service
- [ ] Hook into PM2 or define fallback for local execution
- [ ] Document each command in the `README.md`

---

## 🔗 Related Epics

#cicd #buildtools #devtools #devops

---

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

- Future automated CI pipeline
- Dev onboarding automation

---

## 🔍 Relevant Links

- [pm2-ecosystem-config](pm2-ecosystem-config)
- [services-overview](services-overview)
- [makefile-examples](makefile-examples)
- [project-structure](project-structure)
