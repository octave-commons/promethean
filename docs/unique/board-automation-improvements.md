---
uuid: b9501b1c-c624-41e0-8ca9-b628f3962f52
created_at: board-automation-improvements.md
filename: Board Automation Improvements
title: Board Automation Improvements
description: >-
  Addressing issues with automatic task generation and board automation scripts
  to prevent task clutter and ensure proper task management. The current system
  fails to handle empty columns and requires better integration with process
  documentation. Fixes aim to improve task visibility and maintain board
  integrity.
tags:
  - automation
  - task management
  - board cleanup
related_to_uuid:
  - c0e6ea38-a9a0-4379-aa9c-b634a6591a59
related_to_title:
  - board-walk-2025-08-11
references:
  - uuid: c0e6ea38-a9a0-4379-aa9c-b634a6591a59
    line: 6
    col: 0
    score: 0.86
---
1. Doing lanes, sure. Prompt Refinement, Agent Thinking, Breakdown, are all doing in the sense that I am working on writing them and planning. But there is no code happening for them (ideally, with the AI in the mix and how fast I can work now, some of this may have gotten done) ^ref-ac60a1d6-1-0
2. WIP per lane is set by the `# Title (n)` ^ref-ac60a1d6-2-0
3. Yea that is probably a good idea to make me do that. ^ref-ac60a1d6-3-0
4. Right now any column that is empty seems to be forgotten by the automation scripts. It would be cool for them to be able to refer to my process doc, or some other markdown file as a reference for what the board should look like ^ref-ac60a1d6-4-0
5. Why this one? Honestly the boards kinda... we need to look at it right now. I don't want to say rerrstart it but... a lot of what is in incoming should probably be in the ice box. That task, and several like it, were auto generated, and got pulled in by the automation script I was writing. ^ref-ac60a1d6-5-0


Automation of the board needs some serious work. A lot of these automaticly generated tasks were sort of hidden from me til I fixed the scripts enough for them to not totally ruin the board.
on Update
  - run-step-api
  - Self-Improving Documentation Tool
  - The Jar of Echoes
  - Promethean Dev Workflow Update
  - Creative Moments
  - Duck's Attractor States
  - Promethean Chat Activity Report
  - windows-tiling-with-autohotkey
  - aionian-circuit-math
  - Functional Refactor of TypeScript Document Processing
  - Promethean Notes
  - Canonical Org-Babel Matplotlib Animation Template
  - TypeScript Patch for Tool Calling Support
references:
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 600
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 583
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 610
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 546
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 150
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 30
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 47
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 82
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 148
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 60
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 39
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 168
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 40
    col: 0
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 149
    col: 0
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 285
    col: 0
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 134
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 193
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 203
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 151
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 281
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 181
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 220
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 110
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 118
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 329
    col: 0
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 0
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 151
    col: 0
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 152
    col: 0
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 288
    col: 0
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 299
    col: 0
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 135
    col: 0
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 138
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 57
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 124
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 81
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 183
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 69
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 36
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 46
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 40
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 53
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 33
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 559
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 119
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 315
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 548
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 496
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 224
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 125
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 165
    col: 0
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 287
    col: 0
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 302
    col: 0
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 137
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 593
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 561
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 607
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 548
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 50
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 28
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 232
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 29
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 329
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1539
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 599
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 359
    col: 0
    score: 1
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 449
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 547
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 833
    col: 0
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 295
    col: 0
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 305
    col: 0
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 159
    col: 0
    score: 1
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 134
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 592
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 658
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 683
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 407
    col: 0
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 160
    col: 0
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 306
    col: 0
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 160
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 426
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 1534
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 610
    col: 0
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 1262
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 863
    col: 0
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 308
    col: 0
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 162
    col: 0
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 161
    col: 0
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 163
    col: 0
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 309
    col: 0
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 162
    col: 0
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 163
    col: 0
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 164
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 247
    col: 0
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 311
    col: 0
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 165
    col: 0
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 164
    col: 0
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 390
    col: 0
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 238
    col: 0
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 313
    col: 0
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 167
    col: 0
    score: 1
---
1. Doing lanes, sure. Prompt Refinement, Agent Thinking, Breakdown, are all doing in the sense that I am working on writing them and planning. But there is no code happening for them (ideally, with the AI in the mix and how fast I can work now, some of this may have gotten done) ^ref-ac60a1d6-1-0
2. WIP per lane is set by the `# Title (n)` ^ref-ac60a1d6-2-0
3. Yea that is probably a good idea to make me do that. ^ref-ac60a1d6-3-0
4. Right now any column that is empty seems to be forgotten by the automation scripts. It would be cool for them to be able to refer to my process doc, or some other markdown file as a reference for what the board should look like ^ref-ac60a1d6-4-0
5. Why this one? Honestly the boards kinda... we need to look at it right now. I don't want to say rerrstart it but... a lot of what is in incoming should probably be in the ice box. That task, and several like it, were auto generated, and got pulled in by the automation script I was writing. ^ref-ac60a1d6-5-0


Automation of the board needs some serious work. A lot of these automaticly generated tasks were sort of hidden from me til I fixed the scripts enough for them to not totally ruin the board.
