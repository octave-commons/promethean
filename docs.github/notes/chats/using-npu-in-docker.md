> Based on chat log `docs/chats/2025-08-03_03-57-58_ChatGPT_Promethean - Using NPU in Docker....md`.

## User
Is there any way to use an NPU from Docker?

## ChatGPT
- Containers can access host NPUs by installing drivers on the host, mounting runtime libraries, and passing device nodes with `--device` or runtime plugins.
- Vendor examples include Huawei Ascend with the Ascend docker runtime, Intel's OpenVINO via `--device /dev/dri`, and Google Coral using `--device /dev/apex_0`.
- Ensure environment variables expose the desired device IDs and use images preloaded with the vendor SDK.
- On Windows with WSL, invoke `python.exe` or `node.exe` to run host-side NPU drivers from WSL paths.

#tags: #npu #docker #openvino #promethean
