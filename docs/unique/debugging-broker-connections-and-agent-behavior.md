---
uuid: a463e42f-aba3-40c3-80fe-7a0ced9c4a5c
created_at: debugging-broker-connections-and-agent-behavior.md
filename: debugging-broker-connections
title: debugging-broker-connections
description: >-
  Identifying processes connecting to the broker without crashes, empty
  embeddings, and challenges in tracing agent behavior through session IDs. The
  issue involves complex ECS module design and inconsistent client
  implementations that hinder debugging efforts.
tags:
  - broker connections
  - agent behavior
  - session ids
  - ecs module
  - client implementations
  - debugging challenges
  - empty embeddings
  - process tracing
related_to_uuid:
  - 7842d43c-7d13-46f0-bdf1-561f5e4c6f53
  - 1fcb8421-46eb-4813-ba66-f79b25ef5db7
  - f0c4823c-53e8-4dd2-9452-c99867bc7d2c
related_to_title:
  - promethean-infrastructure-setup
  - api-gateway-versioning
  - Reawakening Duck
references: []
---
It's been a bit of a head scratcher today... ^ref-73d3dbf6-1-0

There is a process that seems to be connecting repeatedly to the broker, but it isn't crashing. ^ref-73d3dbf6-3-0

The broker logs don't provide enough information for me to identify what process is doing that. ^ref-73d3dbf6-5-0

The embeddings seem to be empty often? ^ref-73d3dbf6-7-0

I need an easier way to figure out who is doing what. I only get session IDs right now, and they are not helpful. ^ref-73d3dbf6-9-0

we fixed the shared typescript packages compiling wierdly. It should be fixed for good now, as long as no one tries to use a relative path to import a typescript file from outside of it's module. ^ref-73d3dbf6-11-0

Now, the duck seems to operate, but we aren't following the traces. We don't know why the duck isn't talking. ^ref-73d3dbf6-13-0

The ECS module is a lot to grok still, and I am not sure if we are a fan of it's design.

It is complex. And I don't know if it is a useful kind of complexity. ^ref-73d3dbf6-17-0

Everything does seem to be in order though... I was kinda going crazy today trying to figure out where the system was actually breaking down. ^ref-73d3dbf6-19-0

I think maybe if we worked on standardizing the approach to accessing the broker tomarrow, it might help us track down the issue. There are several diffferent implementations of a client, despite there being a perfectly good shared module.

The agents are not very good at using libraries. They don't get it. ^ref-73d3dbf6-23-0
Code reuse is not something they like to do. Not unless it is a module they made on that pass, not with out you being explicit about your desire for them to do so. 

They will have an easier time once I go through and document more of this. I let myself go out too far with the robots with out checking their work. That is on me. ^ref-73d3dbf6-26-0

I'll be better about it in the future. ^ref-73d3dbf6-28-0

these libraries we have though... that is the thing that did this. We added so much. And there is still more to add. ^ref-73d3dbf6-30-0

There is a plan. It's just a long and arduous path. ^ref-73d3dbf6-32-0

We were in the zone today. We started out a bit squirrelly lookin at a few fun things.... that was fine. We needed the simple easy, detatched wins. We needed to find our footing. We needed to get somewhere. Medication doesn't magically just fix you. You have to do the work. ^ref-73d3dbf6-34-0

I was doing the work today, spinning my wheels until I found a way to go.
ol: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 68
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 16
    col: 0
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 23
    col: 0
    score: 1
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 74
    col: 0
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 16
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 7
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 9
    col: 0
    score: 1
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 8
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 38
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 51
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 79
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 77
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 115
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 61
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 212
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 150
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 52
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 86
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 85
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 92
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 103
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 91
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 86
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 110
    col: 0
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 250
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 523
    col: 0
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 495
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 459
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 27
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1002
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 171
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 112
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 24
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 143
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 241
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 242
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 200
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 194
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 172
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 91
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 87
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 88
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 150
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 132
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1046
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 594
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 578
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 616
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 571
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 385
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 176
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 195
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 198
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 65
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1028
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 208
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 127
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 541
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 375
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 78
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 176
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 175
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 123
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 274
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 327
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 412
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 159
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 95
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 88
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 91
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 69
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 64
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 105
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 92
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 90
    col: 0
    score: 1
  - uuid: 5c152b08-6b69-4bb8-a1a7-66745789c169
    line: 50
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 81
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 220
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 60
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 48
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 71
    col: 0
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 107
    col: 0
    score: 1
  - uuid: 9b694a91-dec5-4708-9462-3f71000ba925
    line: 72
    col: 0
    score: 1
  - uuid: b39dc9d4-63e2-42d4-bbcd-041ef3167bca
    line: 148
    col: 0
    score: 1
  - uuid: 98c8ff62-6ea3-4172-9e8b-93913e5d4a7f
    line: 40
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 16
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 138
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 68
    col: 0
    score: 1
---
It's been a bit of a head scratcher today... ^ref-73d3dbf6-1-0

There is a process that seems to be connecting repeatedly to the broker, but it isn't crashing. ^ref-73d3dbf6-3-0

The broker logs don't provide enough information for me to identify what process is doing that. ^ref-73d3dbf6-5-0

The embeddings seem to be empty often? ^ref-73d3dbf6-7-0

I need an easier way to figure out who is doing what. I only get session IDs right now, and they are not helpful. ^ref-73d3dbf6-9-0

we fixed the shared typescript packages compiling wierdly. It should be fixed for good now, as long as no one tries to use a relative path to import a typescript file from outside of it's module. ^ref-73d3dbf6-11-0

Now, the duck seems to operate, but we aren't following the traces. We don't know why the duck isn't talking. ^ref-73d3dbf6-13-0

The ECS module is a lot to grok still, and I am not sure if we are a fan of it's design.

It is complex. And I don't know if it is a useful kind of complexity. ^ref-73d3dbf6-17-0

Everything does seem to be in order though... I was kinda going crazy today trying to figure out where the system was actually breaking down. ^ref-73d3dbf6-19-0

I think maybe if we worked on standardizing the approach to accessing the broker tomarrow, it might help us track down the issue. There are several diffferent implementations of a client, despite there being a perfectly good shared module.

The agents are not very good at using libraries. They don't get it. ^ref-73d3dbf6-23-0
Code reuse is not something they like to do. Not unless it is a module they made on that pass, not with out you being explicit about your desire for them to do so. 

They will have an easier time once I go through and document more of this. I let myself go out too far with the robots with out checking their work. That is on me. ^ref-73d3dbf6-26-0

I'll be better about it in the future. ^ref-73d3dbf6-28-0

these libraries we have though... that is the thing that did this. We added so much. And there is still more to add. ^ref-73d3dbf6-30-0

There is a plan. It's just a long and arduous path. ^ref-73d3dbf6-32-0

We were in the zone today. We started out a bit squirrelly lookin at a few fun things.... that was fine. We needed the simple easy, detatched wins. We needed to find our footing. We needed to get somewhere. Medication doesn't magically just fix you. You have to do the work. ^ref-73d3dbf6-34-0

I was doing the work today, spinning my wheels until I found a way to go.
