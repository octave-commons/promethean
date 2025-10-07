---
$$
uuid: 12b8b7a3-441d-4550-8fb4-ab0b6e1f3f3f
$$
$$
created_at: '2025-09-30T10:50:12Z'
$$
title: 2025.09.30.10.50.12
filename: nx-lint-affected-projects
$$
description: >-
$$
  Run lint checks for affected projects using Nx. The command identifies
  projects with potential type safety issues and reports errors related to
  unsafe type usage, explicit any types, and mutable parameters.
tags:
  - nx
  - lint
  - typescript
  - affected
  - projects
  - type-safety
  - error-reporting
$$
related_to_uuid: []
$$
$$
related_to_title: []
$$
references: []
---

Run pnpm exec nx affected -t lint --paralell

 NX   No explicit --base argument provided, but found environment variable NX_BASE so using its value as the affected base: c9e3f4ff9d9531c5331f35d4ba755bf375c30884


 NX   No explicit --head argument provided, but found environment variable NX_HEAD so using its value as the affected head: f6b10926eea557fa40f9b3f296f70b4e98854038


 NX   Custom task runners will no longer be supported in Nx 21.

Use Nx Cloud or the Nx Powerpack caches instead.
For more information, see https://nx.dev/features/powerpack/custom-caching


 NX   Custom task runners will no longer be supported in Nx 21.

Use Nx Cloud or the Nx Powerpack caches instead.
For more information, see https://nx.dev/features/powerpack/custom-caching


 NX   Running target lint for 13 projects:

- @promethean/changefeed
- @promethean/compaction
- @promethean/dev
- @promethean/tests
- @promethean/discord
- @promethean/dlq
- @promethean/event
- @promethean/projectors
- @promethean/timetravel
- @promethean/examples
- @promethean/schema
- @promethean/http
- @promethean/ws

With additional flags:
$$
  --paralell=true
$$


❌ > nx run @promethean/examples:lint --paralell
  
  > node ../../tools/scripts/run-eslint.mjs . --paralell
  
  
  /home/runner/work/promethean/promethean/packages/examples/src/process/projector.ts
     8:45  error    Argument 'bus' should be typed with a non-any type                                    @typescript-eslint/explicit-module-boundary-types
     8:50  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
    11:20  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
    11:20  warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
    15:33  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
    15:33  warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
    16:15  error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    16:19  error    Unsafe member access .publish on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    16:34  error    Unsafe member access .ProcessState on an `any` value                                  @typescript-eslint/no-unsafe-member-access
    20:11  error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    20:15  error    Unsafe member access .subscribe on an `any` value                                     @typescript-eslint/no-unsafe-member-access
    21:16  error    Unsafe member access .HeartbeatReceived on an `any` value                             @typescript-eslint/no-unsafe-member-access
    23:19  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
    24:26  error    Unsafe member access .payload on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    26:19  warning  Variable should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")   functional/prefer-immutable-types
    34:17  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    34:33  error    Unsafe member access .ts on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    37:13  warning  Modifying a map is not allowed                                                        functional/immutable-data
    46:9   warning  Unexpected loop, use map or reduce instead                                            functional/no-loop-statements
    49:17  warning  Modifying an existing object/array is not allowed                                     functional/immutable-data
    55:15  error    Missing return type on function                                                       @typescript-eslint/explicit-module-boundary-types
  
  ✖ 21 problems (13 errors, 8 warnings)
  
❌ > nx run @promethean/ws:lint --paralell
  
  > node ../../tools/scripts/run-eslint.mjs . --paralell
  
  
  /home/runner/work/promethean/promethean/packages/ws/src/client.ts
     3:31  error    Unexpected any. Specify a different type                                                                                                                            @typescript-eslint/no-explicit-any
     3:36  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")                                                                                functional/prefer-immutable-types
     3:36  warning  Parameter should be a read only type                                                                                                                                @typescript-eslint/prefer-readonly-parameter-types
     6:5   warning  Property should have a readonly modifier                                                                                                                            functional/prefer-immutable-types
     7:5   warning  Property should have a readonly modifier                                                                                                                            functional/prefer-immutable-types
     7:63  error    Unexpected any. Specify a different type                                                                                                                            @typescript-eslint/no-explicit-any
     8:5   warning  Property should have a readonly modifier                                                                                                                            functional/prefer-immutable-types
    19:13  error    Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises
    24:23  error    Unexpected any. Specify a different type                                                                                                                            @typescript-eslint/no-explicit-any
    24:51  error    Unexpected any. Specify a different type                                                                                                                            @typescript-eslint/no-explicit-any
    27:9   warning  Modifying an existing object/array is not allowed                                                                                                                   functional/immutable-data
    27:13  error    Unsafe member access .corr on an `any` value                                                                                                                        @typescript-eslint/no-unsafe-member-access
    30:13  warning  Modifying a map is not allowed                                                                                                                                      functional/immutable-data
    32:21  warning  Modifying a map is not allowed                                                                                                                                      functional/immutable-data
    38:15  error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    39:17  error    Unsafe member access .op on an `any` value                                                                                                                          @typescript-eslint/no-unsafe-member-access
    39:36  error    Unsafe member access .op on an `any` value                                                                                                                          @typescript-eslint/no-unsafe-member-access
    40:41  error    Unsafe argument of type `any` assigned to a parameter of type `string`                                                                                              @typescript-eslint/no-unsafe-argument
    40:45  error    Unsafe member access .corr on an `any` value                                                                                                                        @typescript-eslint/no-unsafe-member-access
    42:17  warning  Modifying a map is not allowed                                                                                                                                      functional/immutable-data
    42:37  error    Unsafe argument of type `any` assigned to a parameter of type `string`                                                                                              @typescript-eslint/no-unsafe-argument
    42:41  error    Unsafe member access .corr on an `any` value                                                                                                                        @typescript-eslint/no-unsafe-member-access
    43:31  error    Unsafe member access .op on an `any` value                                                                                                                          @typescript-eslint/no-unsafe-member-access
    45:13  warning  Modifying a map is not allowed                                                                                                                                      functional/immutable-data
    45:33  error    Unsafe argument of type `any` assigned to a parameter of type `string`                                                                                              @typescript-eslint/no-unsafe-argument
    45:37  error    Unsafe member access .corr on an `any` value                                                                                                                        @typescript-eslint/no-unsafe-member-access
    47:17  error    Unsafe member access .op on an `any` value                                                                                                                          @typescript-eslint/no-unsafe-member-access
    48:32  error    Unsafe member access .topic on an `any` value                                                                                                                       @typescript-eslint/no-unsafe-member-access
    48:46  error    Unsafe member access .group on an `any` value                                                                                                                       @typescript-eslint/no-unsafe-member-access
    51:17  warning  Modifying a map is not allowed                                                                                                                                      functional/immutable-data
    54:13  warning  Unexpected try-catch, this pattern is not functional                                                                                                                functional/no-try-statements
    55:29  error    Unsafe member access .event on an `any` value                                                                                                                       @typescript-eslint/no-unsafe-member-access
    55:36  error    Unsafe argument of type `any` assigned to a parameter of type `{ attempt: number; ack_deadline_ms: number; }`                                                       @typescript-eslint/no-unsafe-argument
    55:40  error    Unsafe member access .ctx on an `any` value                                                                                                                         @typescript-eslint/no-unsafe-member-access
    57:17  error    Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises
    59:21  error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    59:32  error    Unsafe member access .topic on an `any` value                                                                                                                       @typescript-eslint/no-unsafe-member-access
    60:21  error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    60:32  error    Unsafe member access .group on an `any` value                                                                                                                       @typescript-eslint/no-unsafe-member-access
    61:21  error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    61:29  error    Unsafe member access .event on an `any` value                                                                                                                       @typescript-eslint/no-unsafe-member-access
    63:25  error    Unexpected any. Specify a different type                                                                                                                            @typescript-eslint/no-explicit-any
    64:17  error    Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises
    66:21  error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    66:32  error    Unsafe member access .topic on an `any` value                                                                                                                       @typescript-eslint/no-unsafe-member-access
    67:21  error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    67:32  error    Unsafe member access .group on an `any` value                                                                                                                       @typescript-eslint/no-unsafe-member-access
    68:21  error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    68:29  error    Unsafe member access .event on an `any` value                                                                                                                       @typescript-eslint/no-unsafe-member-access
    69:21  error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    69:31  error    Unsafe member access .message on an `any` value                                                                                                                     @typescript-eslint/no-unsafe-member-access
    75:5   error    Missing return type on function                                                                                                                                     @typescript-eslint/explicit-module-boundary-types
    75:34  error    Argument 'payload' should be typed with a non-any type                                                                                                              @typescript-eslint/explicit-module-boundary-types
    75:43  error    Unexpected any. Specify a different type                                                                                                                            @typescript-eslint/no-explicit-any
    75:48  error    Argument 'opts' should be typed with a non-any type                                                                                                                 @typescript-eslint/explicit-module-boundary-types
    75:55  error    Unexpected any. Specify a different type                                                                                                                            @typescript-eslint/no-explicit-any
    76:50  error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    76:59  error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    79:5   error    Missing return type on function                                                                                                                                     @typescript-eslint/explicit-module-boundary-types
    79:69  error    Argument 'opts' should be typed with a non-any type                                                                                                                 @typescript-eslint/explicit-module-boundary-types
    79:76  error    Unexpected any. Specify a different type                                                                                                                            @typescript-eslint/no-explicit-any
    83:9   warning  Modifying a map is not allowed                                                                                                                                      functional/immutable-data
    84:59  error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    87:5   error    Missing return type on function                                                                                                                                     @typescript-eslint/explicit-module-boundary-types
    88:9   warning  Modifying a map is not allowed                                                                                                                                      functional/immutable-data
    92:5   error    Missing return type on function                                                                                                                                     @typescript-eslint/explicit-module-boundary-types
    93:9   error    Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises
  
  /home/runner/work/promethean/promethean/packages/ws/src/server.rate.ts
    3:8  error  Missing return type on function  @typescript-eslint/explicit-module-boundary-types
    7:8  error  Missing return type on function  @typescript-eslint/explicit-module-boundary-types
  
  /home/runner/work/promethean/promethean/packages/ws/src/server.ts
     10:26   error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     16:12   warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
     16:12   warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
     16:21   error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     19:8    error    Function 'startWSGateway' has too many lines (176). Maximum allowed is 50             max-lines-per-function
     19:8    error    Missing return type on function                                                       @typescript-eslint/explicit-module-boundary-types
     19:32   error    Argument 'bus' should be typed with a non-any type                                    @typescript-eslint/explicit-module-boundary-types
     19:37   error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     33:26   error    Arrow function has too many lines (159). Maximum allowed is 50                        max-lines-per-function
     33:27   warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
     33:27   warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
     34:9    error    Unexpected let, use const instead                                                     functional/no-let
     38:47   error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     40:32   error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     47:17   warning  Unexpected loop, use map or reduce instead                                            functional/no-loop-statements
     48:21   warning  Unexpected loop, use map or reduce instead                                            functional/no-loop-statements
     51:29   warning  Modifying a map is not allowed                                                        functional/immutable-data
     59:26   error    Async arrow function has too many lines (126). Maximum allowed is 50                  max-lines-per-function
     59:26   error    Async arrow function has a complexity of 33. Maximum allowed is 15                    complexity
     59:38   error    Refactor this function to reduce its Cognitive Complexity from 45 to the 15 allowed   sonarjs/cognitive-complexity
     60:13   error    Unexpected let, use const instead                                                     functional/no-let
     60:22   error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     61:13   warning  Unexpected try-catch, this pattern is not functional                                  functional/no-try-statements
     62:17   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
     67:19   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
     67:30   error    Unsafe member access .corr on an `any` value                                          @typescript-eslint/no-unsafe-member-access
     68:90   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
     71:21   error    Unsafe member access .op on an `any` value                                            @typescript-eslint/no-unsafe-member-access
     72:23   warning  Variable should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")   functional/prefer-immutable-types
     72:58   error    Unsafe argument of type `any` assigned to a parameter of type `string | undefined`    @typescript-eslint/no-unsafe-argument
     72:62   error    Unsafe member access .token on an `any` value                                         @typescript-eslint/no-unsafe-member-access
     78:45   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
     84:21   error    Unsafe member access .op on an `any` value                                            @typescript-eslint/no-unsafe-member-access
     86:23   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
     87:39   error    Unsafe argument of type `any` assigned to a parameter of type `string`                @typescript-eslint/no-unsafe-argument
     87:43   error    Unsafe member access .topic on an `any` value                                         @typescript-eslint/no-unsafe-member-access
     88:22   warning  Modifying a map is not allowed                                                        functional/immutable-data
     88:40   error    Unsafe argument of type `any` assigned to a parameter of type `string`                @typescript-eslint/no-unsafe-argument
     88:44   error    Unsafe member access .topic on an `any` value                                         @typescript-eslint/no-unsafe-member-access
     88:68   error    Unsafe argument of type `any` assigned to a parameter of type `string`                @typescript-eslint/no-unsafe-argument
     88:72   error    Unsafe member access .topic on an `any` value                                         @typescript-eslint/no-unsafe-member-access
     88:99   error    Unsafe argument of type `any` assigned to a parameter of type `string`                @typescript-eslint/no-unsafe-argument
     88:103  error    Unsafe member access .topic on an `any` value                                         @typescript-eslint/no-unsafe-member-access
     89:22   error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
     89:25   error    Unsafe member access .tryConsume on an `any` value                                    @typescript-eslint/no-unsafe-member-access
     90:17   warning  Unexpected try-catch, this pattern is not functional                                  functional/no-try-statements
     91:27   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
     91:39   error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
     91:43   error    Unsafe member access .publish on an `any` value                                       @typescript-eslint/no-unsafe-member-access
     91:55   error    Unsafe member access .topic on an `any` value                                         @typescript-eslint/no-unsafe-member-access
     91:66   error    Unsafe member access .payload on an `any` value                                       @typescript-eslint/no-unsafe-member-access
     91:79   error    Unsafe member access .opts on an `any` value                                          @typescript-eslint/no-unsafe-member-access
     92:49   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
     92:55   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
     92:63   error    Unsafe member access .id on an `any` value                                            @typescript-eslint/no-unsafe-member-access
     93:29   error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     94:50   error    Unsafe argument of type `any` assigned to a parameter of type `string`                @typescript-eslint/no-unsafe-argument
     94:52   error    Unsafe member access .message on an `any` value                                       @typescript-eslint/no-unsafe-member-access
     99:21   error    Unsafe member access .op on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    101:23   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    107:23   warning  Variable should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")   functional/prefer-immutable-types
    108:17   warning  Modifying a map is not allowed                                                        functional/immutable-data
    110:23   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    110:36   error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    110:40   error    Unsafe member access .subscribe on an `any` value                                     @typescript-eslint/no-unsafe-member-access
    113:31   error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
    113:41   error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
    118:48   error    Unsafe argument of type `any` assigned to a parameter of type `string`                @typescript-eslint/no-unsafe-argument
    118:50   error    Unsafe member access .id on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    120:31   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    120:64   error    Unsafe member access .ackTimeoutMs on an `any` value                                  @typescript-eslint/no-unsafe-member-access
    121:25   warning  Modifying a map is not allowed                                                        functional/immutable-data
    121:44   error    Unsafe argument of type `any` assigned to a parameter of type `string`                @typescript-eslint/no-unsafe-argument
    121:46   error    Unsafe member access .id on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    122:29   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    123:29   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    124:29   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    124:42   error    Unsafe member access .attempt on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    129:29   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    130:29   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    131:29   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    133:33   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    133:46   error    Unsafe member access .attempt on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    140:17   warning  Modifying an existing object/array is not allowed                                     functional/immutable-data
    140:17   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    141:45   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    145:21   error    Unsafe member access .op on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    147:44   error    Unsafe member access .topic on an `any` value                                         @typescript-eslint/no-unsafe-member-access
    147:58   error    Unsafe member access .group on an `any` value                                         @typescript-eslint/no-unsafe-member-access
    151:17   warning  Modifying a map is not allowed                                                        functional/immutable-data
    152:45   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    156:21   error    Unsafe member access .op on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    156:41   error    Unsafe member access .op on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    156:62   error    Unsafe member access .op on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    158:44   error    Unsafe member access .topic on an `any` value                                         @typescript-eslint/no-unsafe-member-access
    158:58   error    Unsafe member access .group on an `any` value                                         @typescript-eslint/no-unsafe-member-access
    162:45   error    Unsafe argument of type `any` assigned to a parameter of type `string`                @typescript-eslint/no-unsafe-argument
    162:49   error    Unsafe member access .id on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    164:29   error    Unsafe member access .op on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    166:49   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    169:25   error    Unsafe member access .op on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    170:21   warning  Modifying an existing object/array is not allowed                                     functional/immutable-data
    170:76   error    Unsafe member access .extend_ms on an `any` value                                     @typescript-eslint/no-unsafe-member-access
    171:49   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    175:17   warning  Modifying a map is not allowed                                                        functional/immutable-data
    175:35   error    Unsafe argument of type `any` assigned to a parameter of type `string`                @typescript-eslint/no-unsafe-argument
    175:39   error    Unsafe member access .id on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    176:17   warning  Unexpected try-catch, this pattern is not functional                                  functional/no-try-statements
    177:29   error    Unsafe member access .op on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    177:49   error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    177:53   error    Unsafe member access .ack on an `any` value                                           @typescript-eslint/no-unsafe-member-access
    177:61   error    Unsafe member access .topic on an `any` value                                         @typescript-eslint/no-unsafe-member-access
    177:72   error    Unsafe member access .group on an `any` value                                         @typescript-eslint/no-unsafe-member-access
    177:83   error    Unsafe member access .id on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    178:32   error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    178:36   error    Unsafe member access .nack on an `any` value                                          @typescript-eslint/no-unsafe-member-access
    178:45   error    Unsafe member access .topic on an `any` value                                         @typescript-eslint/no-unsafe-member-access
    178:56   error    Unsafe member access .group on an `any` value                                         @typescript-eslint/no-unsafe-member-access
    178:67   error    Unsafe member access .id on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    178:75   error    Unsafe member access .reason on an `any` value                                        @typescript-eslint/no-unsafe-member-access
    179:42   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    180:29   error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
    181:46   error    Unsafe argument of type `any` assigned to a parameter of type `string`                @typescript-eslint/no-unsafe-argument
    181:48   error    Unsafe member access .message on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    188:13   warning  Unexpected loop, use map or reduce instead                                            functional/no-loop-statements
    189:13   warning  Modifying a map is not allowed                                                        functional/immutable-data
  
  ✖ 195 problems (160 errors, 35 warnings)
  
✅ > nx run @promethean/event:lint --paralell
❌ > nx run @promethean/http:lint --paralell
  
  > node ../../tools/scripts/run-eslint.mjs . --paralell
  
  
  /home/runner/work/promethean/promethean/packages/http/src/hf.ts
    13:5   warning  Property should have a readonly modifier                                                functional/prefer-immutable-types
    14:5   warning  Property should have a readonly modifier                                                functional/prefer-immutable-types
    23:15  warning  Variable should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")     functional/prefer-immutable-types
    28:13  warning  Modifying an existing object/array is not allowed                                       functional/immutable-data
    44:37  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")    functional/prefer-immutable-types
    44:37  warning  Parameter should be a read only type                                                    @typescript-eslint/prefer-readonly-parameter-types
    50:32  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")    functional/prefer-immutable-types
    50:32  warning  Parameter should be a read only type                                                    @typescript-eslint/prefer-readonly-parameter-types
    50:53  warning  Return type should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
  
  /home/runner/work/promethean/promethean/packages/http/src/publish.ts
     4:8   error    Missing return type on function                       @typescript-eslint/explicit-module-boundary-types
     4:36  error    Argument 'bus' should be typed with a non-any type    @typescript-eslint/explicit-module-boundary-types
     4:41  error    Unexpected any. Specify a different type              @typescript-eslint/no-explicit-any
     9:9   warning  Unexpected try-catch, this pattern is not functional  functional/no-try-statements
    10:19  error    Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
    10:31  error    Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    10:35  error    Unsafe member access .publish on an `any` value       @typescript-eslint/no-unsafe-member-access
    11:17  error    Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
    11:41  error    Unexpected any. Specify a different type              @typescript-eslint/no-explicit-any
    13:24  error    Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
    13:32  error    Unsafe member access .id on an `any` value            @typescript-eslint/no-unsafe-member-access
    14:21  error    Unexpected any. Specify a different type              @typescript-eslint/no-explicit-any
    15:36  error    Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
    15:45  error    Unsafe member access .message on an `any` value       @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/http/src/replay.ts
     3:8   error    Function 'startReplayAPI' has too many lines (70). Maximum allowed is 50             max-lines-per-function
     3:8   error    Missing return type on function                                                      @typescript-eslint/explicit-module-boundary-types
     3:32  error    Argument 'store' should be typed with a non-any type                                 @typescript-eslint/explicit-module-boundary-types
     3:39  error    Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
     8:9   warning  Unexpected try-catch, this pattern is not functional                                 functional/no-try-statements
    20:19  error    Unsafe assignment of an `any` value                                                  @typescript-eslint/no-unsafe-assignment
    20:34  error    Unsafe call of a(n) `any` typed value                                                @typescript-eslint/no-unsafe-call
    20:40  error    Unsafe member access .scan on an `any` value                                         @typescript-eslint/no-unsafe-member-access
    25:31  error    Unsafe assignment of an `any` value                                                  @typescript-eslint/no-unsafe-assignment
    25:45  error    Unsafe member access .length on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    25:53  error    Unsafe assignment of an `any` value                                                  @typescript-eslint/no-unsafe-assignment
    26:21  error    Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
    27:36  error    Unsafe assignment of an `any` value                                                  @typescript-eslint/no-unsafe-assignment
    27:45  error    Unsafe member access .message on an `any` value                                      @typescript-eslint/no-unsafe-member-access
    32:24  error    Async arrow function has a complexity of 17. Maximum allowed is 15                   complexity
    32:41  error    Refactor this function to reduce its Cognitive Complexity from 25 to the 15 allowed  sonarjs/cognitive-complexity
    33:9   warning  Unexpected try-catch, this pattern is not functional                                 functional/no-try-statements
    41:13  error    Unexpected let, use const instead                                                    functional/no-let
    43:13  error    Unexpected let, use const instead                                                    functional/no-let
    44:13  warning  Unexpected loop, use map or reduce instead                                           functional/no-loop-statements
    45:23  error    Unsafe assignment of an `any` value                                                  @typescript-eslint/no-unsafe-assignment
    45:37  error    Unsafe call of a(n) `any` typed value                                                @typescript-eslint/no-unsafe-call
    45:43  error    Unsafe member access .scan on an `any` value                                         @typescript-eslint/no-unsafe-member-access
    49:23  error    Unsafe assignment of an `any` value                                                  @typescript-eslint/no-unsafe-assignment
    49:34  error    Unsafe call of a(n) `any` typed value                                                @typescript-eslint/no-unsafe-call
    49:40  error    Unsafe member access .filter on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    49:51  error    Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
    49:61  error    Unsafe member access .ts on an `any` value                                           @typescript-eslint/no-unsafe-member-access
    50:30  error    Unsafe member access .length on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    51:17  warning  Unexpected loop, use map or reduce instead                                           functional/no-loop-statements
    60:23  error    Unsafe assignment of an `any` value                                                  @typescript-eslint/no-unsafe-assignment
    60:30  error    Unsafe call of a(n) `any` typed value                                                @typescript-eslint/no-unsafe-call
    60:39  error    Unsafe member access .at on an `any` value                                           @typescript-eslint/no-unsafe-member-access
    61:17  error    Unsafe assignment of an `any` value                                                  @typescript-eslint/no-unsafe-assignment
    61:33  error    Unsafe member access .ts on an `any` value                                           @typescript-eslint/no-unsafe-member-access
    62:30  error    Unsafe member access .length on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    66:21  error    Unexpected any. Specify a different type                                             @typescript-eslint/no-explicit-any
    67:36  error    Unsafe assignment of an `any` value                                                  @typescript-eslint/no-unsafe-assignment
    67:45  error    Unsafe member access .message on an `any` value                                      @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/http/src/tests/hf.test.ts
    12:11  error  Unsafe assignment of an `any` value                 @typescript-eslint/no-unsafe-assignment
    16:11  error  Unsafe assignment of an `any` value                 @typescript-eslint/no-unsafe-assignment
    16:20  error  Unsafe call of a(n) `any` typed value               @typescript-eslint/no-unsafe-call
    17:11  error  Unsafe assignment of an `any` value                 @typescript-eslint/no-unsafe-assignment
    17:26  error  Unsafe call of a(n) `any` typed value               @typescript-eslint/no-unsafe-call
    17:33  error  Unsafe member access .embeddings on an `any` value  @typescript-eslint/no-unsafe-member-access
  
  ✖ 68 problems (54 errors, 14 warnings)
  
✅ > nx run @promethean/dev:lint --paralell
❌ > nx run @promethean/schema:lint --paralell
  
  > node ../../tools/scripts/run-eslint.mjs . --paralell
  
  
  /home/runner/work/promethean/promethean/packages/schema/src/dualwrite.ts
     4:31  error    Argument 'bus' should be typed with a non-any type                                    @typescript-eslint/explicit-module-boundary-types
     4:36  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     4:41  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
     4:41  warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
     4:63  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     7:59  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     7:78  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
    10:17  warning  Modifying an existing object/array is not allowed                                     functional/immutable-data
    10:17  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    10:22  error    Unsafe member access .headers on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    11:30  error    Unsafe member access .headers on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    19:17  error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    19:21  error    Unsafe member access .publish on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    21:20  error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    21:24  error    Unsafe member access .publish on an `any` value                                       @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/schema/src/normalize.ts
     5:8   error    Async function 'subscribeNormalized' has too many parameters (7). Maximum allowed is 4  max-params
     5:8   error    Missing return type on function                                                         @typescript-eslint/explicit-module-boundary-types
     6:5   error    Argument 'bus' should be typed with a non-any type                                      @typescript-eslint/explicit-module-boundary-types
     6:10  error    Unexpected any. Specify a different type                                                @typescript-eslint/no-explicit-any
     9:5   warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")    functional/prefer-immutable-types
     9:5   warning  Parameter should be a read only type                                                    @typescript-eslint/prefer-readonly-parameter-types
    10:5   warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")    functional/prefer-immutable-types
    10:5   warning  Parameter should be a read only type                                                    @typescript-eslint/prefer-readonly-parameter-types
    11:18  error    Unexpected any. Specify a different type                                                @typescript-eslint/no-explicit-any
    12:11  error    Unexpected any. Specify a different type                                                @typescript-eslint/no-explicit-any
    14:12  error    Unsafe call of a(n) `any` typed value                                                   @typescript-eslint/no-unsafe-call
    14:16  error    Unsafe member access .subscribe on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    17:19  error    Unexpected any. Specify a different type                                                @typescript-eslint/no-explicit-any
    18:19  error    Unsafe assignment of an `any` value                                                     @typescript-eslint/no-unsafe-assignment
    19:38  error    Unsafe member access .payload on an `any` value                                         @typescript-eslint/no-unsafe-member-access
    19:59  error    Unsafe member access .headers on an `any` value                                         @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/schema/src/registry.ts
    14:5   warning  Property should have a readonly modifier                                                functional/prefer-immutable-types
    16:14  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")    functional/prefer-immutable-types
    16:14  warning  Parameter should be a read only type                                                    @typescript-eslint/prefer-readonly-parameter-types
    27:9   warning  Modifying an array is not allowed                                                       functional/immutable-data
    28:9   warning  Modifying a map is not allowed                                                          functional/immutable-data
    31:27  warning  Return type should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
    45:22  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")    functional/prefer-immutable-types
    45:22  warning  Parameter should be a read only type                                                    @typescript-eslint/prefer-readonly-parameter-types
    45:40  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")    functional/prefer-immutable-types
    45:40  warning  Parameter should be a read only type                                                    @typescript-eslint/prefer-readonly-parameter-types
  
  /home/runner/work/promethean/promethean/packages/schema/src/upcast.ts
     4:28  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     4:36  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     8:5   warning  Property should have a readonly modifier                                              functional/prefer-immutable-types
    10:5   error    Missing return type on function                                                       @typescript-eslint/explicit-module-boundary-types
    12:9   warning  Modifying a map is not allowed                                                        functional/immutable-data
    13:9   warning  Modifying a map is not allowed                                                        functional/immutable-data
    17:29  error    Argument 'e' should be typed with a non-any type                                      @typescript-eslint/explicit-module-boundary-types
    17:32  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
    17:37  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
    17:37  warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
    17:59  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
    22:31  error    Unsafe member access .headers on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    23:9   error    Unexpected let, use const instead                                                     functional/no-let
    24:9   error    Unexpected let, use const instead                                                     functional/no-let
    24:13  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    26:9   warning  Unexpected loop, use map or reduce instead                                            functional/no-loop-statements
    29:13  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    33:9   warning  Modifying an existing object/array is not allowed                                     functional/immutable-data
    33:9   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    33:13  error    Unsafe member access .headers on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    34:21  error    Unsafe member access .headers on an `any` value                                       @typescript-eslint/no-unsafe-member-access
  
  ✖ 62 problems (38 errors, 24 warnings)
  
❌ > nx run @promethean/timetravel:lint --paralell
  
  > node ../../tools/scripts/run-eslint.mjs . --paralell
  
  
  /home/runner/work/promethean/promethean/packages/timetravel/src/examples.ts
    4:8   error  Missing return type on function                       @typescript-eslint/explicit-module-boundary-types
    4:33  error  Argument 'store' should be typed with a non-any type  @typescript-eslint/explicit-module-boundary-types
    4:40  error  Unexpected any. Specify a different type              @typescript-eslint/no-explicit-any
    9:24  error  Unexpected any. Specify a different type              @typescript-eslint/no-explicit-any
    9:32  error  Unexpected any. Specify a different type              @typescript-eslint/no-explicit-any
    9:42  error  Unsafe member access .payload on an `any` value       @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/timetravel/src/reconstruct.ts
     3:33  error    Unexpected any. Specify a different type                                                        @typescript-eslint/no-explicit-any
     8:32  error    Unexpected any. Specify a different type                                                        @typescript-eslint/no-explicit-any
     9:49  warning  Return type should have an immutability of at least "ReadonlyDeep" (actual: "ReadonlyShallow")  functional/prefer-immutable-types
    12:8   error    Missing return type on function                                                                 @typescript-eslint/explicit-module-boundary-types
    12:41  error    Unexpected any. Specify a different type                                                        @typescript-eslint/no-explicit-any
    12:46  error    Argument 'store' should be typed with a non-any type                                            @typescript-eslint/explicit-module-boundary-types
    12:53  error    Unexpected any. Specify a different type                                                        @typescript-eslint/no-explicit-any
    12:58  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")            functional/prefer-immutable-types
    12:58  warning  Parameter should be a read only type                                                            @typescript-eslint/prefer-readonly-parameter-types
    13:5   error    Unexpected let, use const instead                                                               functional/no-let
    14:5   error    Unexpected let, use const instead                                                               functional/no-let
    26:11  error    Unsafe assignment of an `any` value                                                             @typescript-eslint/no-unsafe-assignment
    26:26  error    Unsafe call of a(n) `any` typed value                                                           @typescript-eslint/no-unsafe-call
    26:32  error    Unsafe member access .scan on an `any` value                                                    @typescript-eslint/no-unsafe-member-access
    27:5   warning  Unexpected loop, use map or reduce instead                                                      functional/no-loop-statements
    28:15  error    Unsafe member access .ts on an `any` value                                                      @typescript-eslint/no-unsafe-member-access
    29:15  error    Unsafe member access .key on an `any` value                                                     @typescript-eslint/no-unsafe-member-access
    31:9   error    Unsafe assignment of an `any` value                                                             @typescript-eslint/no-unsafe-assignment
    31:20  error    Unsafe member access .ts on an `any` value                                                      @typescript-eslint/no-unsafe-member-access
  
  ✖ 25 problems (21 errors, 4 warnings)
  
✅ > nx run @promethean/changefeed:lint --paralell
❌ > nx run @promethean/discord:lint --paralell
  
  
  > @promethean/discord@0.0.1 lint /home/runner/work/promethean/promethean/packages/discord
  > node ../../tools/scripts/run-eslint.mjs . "--paralell"
  
  
  /home/runner/work/promethean/promethean/packages/discord/src/attachment-indexer/index.ts
     4:8   error    Missing return type on function                                         @typescript-eslint/explicit-module-boundary-types
     4:50  error    Argument 'evt' should be typed with a non-any type                      @typescript-eslint/explicit-module-boundary-types
     4:55  error    Unexpected any. Specify a different type                                @typescript-eslint/no-explicit-any
     5:12  error    Unsafe member access .attachments on an `any` value                     @typescript-eslint/no-unsafe-member-access
     7:35  error    Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument
     7:39  error    Unsafe member access .provider on an `any` value                        @typescript-eslint/no-unsafe-member-access
     7:49  error    Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument
     7:53  error    Unsafe member access .tenant on an `any` value                          @typescript-eslint/no-unsafe-member-access
     8:3   error    Unsafe call of a(n) `error` type typed value                            @typescript-eslint/no-unsafe-call
     8:22  error    Unsafe member access .tenant on an `any` value                          @typescript-eslint/no-unsafe-member-access
    10:10  error    Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    10:14  error    Unsafe member access .attachments on an `any` value                     @typescript-eslint/no-unsafe-member-access
    10:34  error    Unexpected any. Specify a different type                                @typescript-eslint/no-explicit-any
    11:5   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    11:19  error    Unsafe member access .provider on an `any` value                        @typescript-eslint/no-unsafe-member-access
    12:5   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    12:17  error    Unsafe member access .tenant on an `any` value                          @typescript-eslint/no-unsafe-member-access
    13:5   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    13:21  error    Unsafe member access .message_id on an `any` value                      @typescript-eslint/no-unsafe-member-access
    14:5   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    14:23  error    Unsafe member access .urn on an `any` value                             @typescript-eslint/no-unsafe-member-access
    15:5   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    15:12  error    Unsafe member access .url on an `any` value                             @typescript-eslint/no-unsafe-member-access
    16:5   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    16:21  error    Unsafe member access .content_type on an `any` value                    @typescript-eslint/no-unsafe-member-access
    17:5   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    17:13  error    Unsafe member access .size on an `any` value                            @typescript-eslint/no-unsafe-member-access
    18:5   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    18:15  error    Unsafe member access .sha256 on an `any` value                          @typescript-eslint/no-unsafe-member-access
    19:5   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    19:21  error    Unsafe member access .created_at on an `any` value                      @typescript-eslint/no-unsafe-member-access
    27:3   warning  Unexpected loop, use map or reduce instead                              functional/no-loop-statements
  
  /home/runner/work/promethean/promethean/packages/discord/src/embedder/converter.ts
    1:25  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "ReadonlyShallow")    functional/prefer-immutable-types
    1:25  warning  Parameter should be a read only type                                                            @typescript-eslint/prefer-readonly-parameter-types
    1:39  warning  Return type should have an immutability of at least "ReadonlyDeep" (actual: "ReadonlyShallow")  functional/prefer-immutable-types
  
  /home/runner/work/promethean/promethean/packages/discord/src/embedder/index.ts
    24:1   error    Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises
    24:2   error    Async arrow function has too many lines (82). Maximum allowed is 50                                                                                                 max-lines-per-function
    29:9   error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    29:29  error    Unsafe call of a(n) `any` typed value                                                                                                                               @typescript-eslint/no-unsafe-call
    30:9   error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    30:14  error    Unsafe call of a(n) `any` typed value                                                                                                                               @typescript-eslint/no-unsafe-call
    30:26  error    Unsafe member access .db on an `any` value                                                                                                                          @typescript-eslint/no-unsafe-member-access
    33:9   warning  Variable should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")                                                                                 functional/prefer-immutable-types
    33:9   error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    34:5   error    Unsafe call of a(n) `any` typed value                                                                                                                               @typescript-eslint/no-unsafe-call
    34:8   error    Unsafe member access .collection on an `any` value                                                                                                                  @typescript-eslint/no-unsafe-member-access
    37:9   error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    37:20  error    Unsafe construction of a(n) `any` typed value                                                                                                                       @typescript-eslint/no-unsafe-call
    38:9   error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    38:23  error    Unsafe call of a(n) `any` typed value                                                                                                                               @typescript-eslint/no-unsafe-call
    38:32  error    Unsafe member access .createCollection on an `any` value                                                                                                            @typescript-eslint/no-unsafe-member-access
    49:3   warning  Unexpected loop, use map or reduce instead                                                                                                                          functional/no-loop-statements
    50:24  warning  Promise constructor parameters must be named to match "^_?resolve$"                                                                                                 promise/param-names
    64:26  warning  Promise constructor parameters must be named to match "^_?resolve$"                                                                                                 promise/param-names
    69:66  error    Unsafe member access .name on an `any` value                                                                                                                        @typescript-eslint/no-unsafe-member-access
    76:5   warning  Unexpected try-catch, this pattern is not functional                                                                                                                functional/no-try-statements
    77:7   warning  Unexpected loop, use map or reduce instead                                                                                                                          functional/no-loop-statements
    78:15  error    Unsafe call of a(n) `any` typed value                                                                                                                               @typescript-eslint/no-unsafe-call
    78:21  error    Unsafe member access .addEntry on an `any` value                                                                                                                    @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/discord/src/gateway/gateway.ts
     6:15  warning  Property should have a readonly modifier                 functional/prefer-immutable-types
     7:3   error    Missing return type on function                          @typescript-eslint/explicit-module-boundary-types
     7:54  error    Argument 'payload' should be typed with a non-any type   @typescript-eslint/explicit-module-boundary-types
     7:63  error    Unexpected any. Specify a different type                 @typescript-eslint/no-explicit-any
     9:11  error    Unsafe call of a(n) `error` type typed value             @typescript-eslint/no-unsafe-call
     9:20  error    Unsafe member access .publish on an `error` typed value  @typescript-eslint/no-unsafe-member-access
    11:3   error    Missing return type on function                          @typescript-eslint/explicit-module-boundary-types
    11:61  error    Argument 'raw' should be typed with a non-any type       @typescript-eslint/explicit-module-boundary-types
    11:66  error    Unexpected any. Specify a different type                 @typescript-eslint/no-explicit-any
    12:11  error    Unsafe assignment of an error typed value                @typescript-eslint/no-unsafe-assignment
    12:17  error    Unsafe call of a(n) `error` type typed value             @typescript-eslint/no-unsafe-call
    19:11  error    Unsafe call of a(n) `error` type typed value             @typescript-eslint/no-unsafe-call
    19:20  error    Unsafe member access .publish on an `error` typed value  @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/discord/src/gateway/index.ts
    7:3  warning  Unexpected loop, use map or reduce instead  functional/no-loop-statements
  
  /home/runner/work/promethean/promethean/packages/discord/src/message-embedder/index.ts
    18:3   warning  Parameter should be a read only type                              @typescript-eslint/prefer-readonly-parameter-types
    26:9   error    Unsafe assignment of an error typed value                         @typescript-eslint/no-unsafe-assignment
    26:18  error    Unsafe call of a(n) `error` type typed value                      @typescript-eslint/no-unsafe-call
    32:9   error    Unsafe call of a(n) `error` type typed value                      @typescript-eslint/no-unsafe-call
    32:16  error    Unsafe member access .ensureCollection on an `error` typed value  @typescript-eslint/no-unsafe-member-access
    33:9   error    Unsafe assignment of an error typed value                         @typescript-eslint/no-unsafe-assignment
    33:20  error    Unsafe call of a(n) `error` type typed value                      @typescript-eslint/no-unsafe-call
    34:9   error    Unsafe assignment of an error typed value                         @typescript-eslint/no-unsafe-assignment
    34:27  error    Unsafe call of a(n) `error` type typed value                      @typescript-eslint/no-unsafe-call
    34:36  error    Unsafe member access .embedOne on an `error` typed value          @typescript-eslint/no-unsafe-member-access
    35:9   error    Unsafe call of a(n) `error` type typed value                      @typescript-eslint/no-unsafe-call
    35:16  error    Unsafe member access .upsert on an `error` typed value            @typescript-eslint/no-unsafe-member-access
    38:7   error    Unsafe assignment of an error typed value                         @typescript-eslint/no-unsafe-assignment
  
  /home/runner/work/promethean/promethean/packages/discord/src/message-indexer/index.ts
     4:8   error    Missing return type on function                                         @typescript-eslint/explicit-module-boundary-types
     4:50  error    Argument 'evt' should be typed with a non-any type                      @typescript-eslint/explicit-module-boundary-types
     4:55  error    Unexpected any. Specify a different type                                @typescript-eslint/no-explicit-any
     6:35  error    Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument
     6:39  error    Unsafe member access .provider on an `any` value                        @typescript-eslint/no-unsafe-member-access
     6:49  error    Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument
     6:53  error    Unsafe member access .tenant on an `any` value                          @typescript-eslint/no-unsafe-member-access
     7:9   error    Unsafe assignment of an error typed value                               @typescript-eslint/no-unsafe-assignment
     7:14  error    Unsafe call of a(n) `error` type typed value                            @typescript-eslint/no-unsafe-call
     7:33  error    Unsafe member access .tenant on an `any` value                          @typescript-eslint/no-unsafe-member-access
    10:5   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    10:19  error    Unsafe member access .provider on an `any` value                        @typescript-eslint/no-unsafe-member-access
    11:5   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    11:17  error    Unsafe member access .tenant on an `any` value                          @typescript-eslint/no-unsafe-member-access
    12:5   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    12:21  error    Unsafe member access .message_id on an `any` value                      @typescript-eslint/no-unsafe-member-access
    13:5   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    13:21  error    Unsafe member access .author_urn on an `any` value                      @typescript-eslint/no-unsafe-member-access
    14:5   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    14:20  error    Unsafe member access .space_urn on an `any` value                       @typescript-eslint/no-unsafe-member-access
    15:5   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    15:15  error    Unsafe member access .text on an `any` value                            @typescript-eslint/no-unsafe-member-access
    16:5   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    16:22  error    Unsafe member access .attachments on an `any` value                     @typescript-eslint/no-unsafe-member-access
    17:5   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    17:21  error    Unsafe member access .created_at on an `any` value                      @typescript-eslint/no-unsafe-member-access
    25:9   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    26:9   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    27:9   error    Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    31:12  error    Unsafe assignment of an error typed value                               @typescript-eslint/no-unsafe-assignment
    38:3   warning  Unexpected loop, use map or reduce instead                              functional/no-loop-statements
  
  /home/runner/work/promethean/promethean/packages/discord/src/rest/rest.ts
     18:3   warning  Property should have a readonly modifier                                              functional/prefer-immutable-types
     19:3   warning  Property should have a readonly modifier                                              functional/prefer-immutable-types
     29:11  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
     31:11  error    Unsafe assignment of an error typed value                                             @typescript-eslint/no-unsafe-assignment
     31:20  error    Unsafe construction of a(n) `error` type typed value                                  @typescript-eslint/no-unsafe-call
     39:3   error    Missing return type on function                                                       @typescript-eslint/explicit-module-boundary-types
     47:3   error    Missing return type on function                                                       @typescript-eslint/explicit-module-boundary-types
     55:3   error    Missing return type on function                                                       @typescript-eslint/explicit-module-boundary-types
     65:3   error    Missing return type on function                                                       @typescript-eslint/explicit-module-boundary-types
     74:3   error    Missing return type on function                                                       @typescript-eslint/explicit-module-boundary-types
     76:5   warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
     76:5   warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
     96:3   error    Missing return type on function                                                       @typescript-eslint/explicit-module-boundary-types
    105:3   error    Async method 'send' has too many lines (76). Maximum allowed is 50                    max-lines-per-function
    105:3   error    Async method 'send' has too many parameters (6). Maximum allowed is 4                 max-params
    113:11  error    Unsafe assignment of an error typed value                                             @typescript-eslint/no-unsafe-assignment
    113:20  error    Unsafe call of a(n) `error` type typed value                                          @typescript-eslint/no-unsafe-call
    116:11  error    Unsafe call of a(n) `error` type typed value                                          @typescript-eslint/no-unsafe-call
    116:18  error    Unsafe member access .checkCapability on an `error` typed value                       @typescript-eslint/no-unsafe-member-access
    123:11  error    Unsafe assignment of an error typed value                                             @typescript-eslint/no-unsafe-assignment
    123:17  error    Unsafe call of a(n) `error` type typed value                                          @typescript-eslint/no-unsafe-call
    124:11  error    Unsafe assignment of an error typed value                                             @typescript-eslint/no-unsafe-assignment
    124:23  error    Unsafe call of a(n) `error` type typed value                                          @typescript-eslint/no-unsafe-call
    124:27  error    Unsafe member access .get on an `error` typed value                                   @typescript-eslint/no-unsafe-member-access
    125:11  error    Unsafe assignment of an error typed value                                             @typescript-eslint/no-unsafe-assignment
    125:23  error    Unsafe member access .credentials on an `error` typed value                           @typescript-eslint/no-unsafe-member-access
    127:11  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    135:10  error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    135:17  error    Unsafe member access .tryConsume on an `any` value                                    @typescript-eslint/no-unsafe-member-access
    136:13  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    136:23  error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    136:30  error    Unsafe member access .deficit on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    137:40  error    Unsafe argument of type `any` assigned to a parameter of type `number`                @typescript-eslint/no-unsafe-argument
    142:5   error    Unexpected let, use const instead                                                     functional/no-let
    143:5   warning  Unexpected try-catch, this pattern is not functional                                  functional/no-try-statements
    144:13  warning  Variable should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")   functional/prefer-immutable-types
    163:7   error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    163:14  error    Unsafe member access .drain on an `any` value                                         @typescript-eslint/no-unsafe-member-access
    178:11  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
  
  /home/runner/work/promethean/promethean/packages/discord/src/tests/attachments.test.ts
     5:3   warning  Modifying an existing object/array is not allowed                                     functional/immutable-data
     6:9   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    18:12  error    Unsafe member access .length on an `any` value                                        @typescript-eslint/no-unsafe-member-access
    20:5   error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    20:9   error    Unsafe member access .every on an `any` value                                         @typescript-eslint/no-unsafe-member-access
    21:8   warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
    21:8   warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
  
  /home/runner/work/promethean/promethean/packages/discord/src/tests/flow.test.ts
    21:33  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
    21:33  warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
    50:9   error    Unsafe assignment of an error typed value                                             @typescript-eslint/no-unsafe-assignment
    50:15  error    Unsafe construction of a(n) `error` type typed value                                  @typescript-eslint/no-unsafe-call
    54:11  error    Unsafe call of a(n) `error` type typed value                                          @typescript-eslint/no-unsafe-call
    54:48  error    Unsafe member access .subscribe on an `error` typed value                             @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/discord/src/tests/gateway.test.ts
     6:9   error  Unsafe assignment of an error typed value                  @typescript-eslint/no-unsafe-assignment
     6:15  error  Unsafe construction of a(n) `error` type typed value       @typescript-eslint/no-unsafe-call
     8:3   error  Unexpected let, use const instead                          functional/no-let
     9:3   error  Unexpected let, use const instead                          functional/no-let
    10:3   error  Unexpected let, use const instead                          functional/no-let
    14:3   error  Unexpected let, use const instead                          functional/no-let
    18:9   error  Unsafe call of a(n) `error` type typed value               @typescript-eslint/no-unsafe-call
    18:13  error  Unsafe member access .subscribe on an `error` typed value  @typescript-eslint/no-unsafe-member-access
    26:9   error  Unsafe call of a(n) `error` type typed value               @typescript-eslint/no-unsafe-call
    26:13  error  Unsafe member access .subscribe on an `error` typed value  @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/discord/src/tests/message-embedder.test.ts
    15:3  warning  Modifying an existing object/array is not allowed  functional/immutable-data
    16:3  warning  Modifying an existing object/array is not allowed  functional/immutable-data
  
  /home/runner/work/promethean/promethean/packages/discord/src/tests/message-indexer.test.ts
     5:3   warning  Modifying an existing object/array is not allowed  functional/immutable-data
    16:16  error    Unexpected any. Specify a different type           @typescript-eslint/no-explicit-any
    16:21  error    Unsafe member access .doc on an `any` value        @typescript-eslint/no-unsafe-member-access
    17:16  error    Unexpected any. Specify a different type           @typescript-eslint/no-explicit-any
    17:21  error    Unsafe member access .doc on an `any` value        @typescript-eslint/no-unsafe-member-access
    18:16  error    Unexpected any. Specify a different type           @typescript-eslint/no-explicit-any
    18:21  error    Unsafe member access .doc on an `any` value        @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/discord/src/tests/rest.test.ts
     7:3   warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
     7:3   warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
     9:18  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
     9:18  warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
     9:42  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
     9:42  warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
    21:3   warning  Modifying an existing object/array is not allowed                                     functional/immutable-data
    29:9   warning  Variable should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")   functional/prefer-immutable-types
  
  ✖ 196 problems (160 errors, 36 warnings)
  
   ELIFECYCLE  Command failed with exit code 1.
❌ > nx run @promethean/compaction:lint --paralell
  
  > node ../../tools/scripts/run-eslint.mjs . --paralell
  
  
  /home/runner/work/promethean/promethean/packages/compaction/src/compactor.ts
     8:21  error    Unexpected any. Specify a different type                                                                                                                            @typescript-eslint/no-explicit-any
    13:32  error    Argument 'store' should be typed with a non-any type                                                                                                                @typescript-eslint/explicit-module-boundary-types
    13:39  error    Unexpected any. Specify a different type                                                                                                                            @typescript-eslint/no-explicit-any
    13:44  error    Argument 'bus' should be typed with a non-any type                                                                                                                  @typescript-eslint/explicit-module-boundary-types
    13:49  error    Unexpected any. Specify a different type                                                                                                                            @typescript-eslint/no-explicit-any
    13:54  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")                                                                                functional/prefer-immutable-types
    13:54  warning  Parameter should be a read only type                                                                                                                                @typescript-eslint/prefer-readonly-parameter-types
    16:5   error    Unexpected let, use const instead                                                                                                                                   functional/no-let
    17:5   error    Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises
    18:9   warning  Unexpected loop, use map or reduce instead                                                                                                                          functional/no-loop-statements
    19:13  warning  Unexpected try-catch, this pattern is not functional                                                                                                                functional/no-try-statements
    21:28  error    Unsafe member access .latestByKey on an `any` value                                                                                                                 @typescript-eslint/no-unsafe-member-access
    22:23  error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    22:38  error    Unsafe call of a(n) `any` typed value                                                                                                                               @typescript-eslint/no-unsafe-call
    22:44  error    Unsafe member access .latestByKey on an `any` value                                                                                                                 @typescript-eslint/no-unsafe-member-access
    23:48  error    Unsafe argument of type `any` assigned to a parameter of type `{ [s: string]: unknown; } | ArrayLike<unknown>`                                                      @typescript-eslint/no-unsafe-argument
    29:17  warning  Unexpected loop, use map or reduce instead                                                                                                                          functional/no-loop-statements
    30:27  error    Unsafe call of a(n) `any` typed value                                                                                                                               @typescript-eslint/no-unsafe-call
    30:31  error    Unsafe member access .publish on an `any` value                                                                                                                     @typescript-eslint/no-unsafe-member-access
    32:32  error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    32:49  error    Unexpected any. Specify a different type                                                                                                                            @typescript-eslint/no-explicit-any
    32:55  error    Unsafe member access .payload on an `any` value                                                                                                                     @typescript-eslint/no-unsafe-member-access
    32:64  error    Unsafe assignment of an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-assignment
    32:76  error    Unexpected any. Specify a different type                                                                                                                            @typescript-eslint/no-explicit-any
    32:82  error    Unsafe member access .ts on an `any` value                                                                                                                          @typescript-eslint/no-unsafe-member-access
    44:15  error    Missing return type on function                                                                                                                                     @typescript-eslint/explicit-module-boundary-types
  
  ✖ 26 problems (21 errors, 5 warnings)
  
❌ > nx run @promethean/dlq:lint --paralell
  
  > node ../../tools/scripts/run-eslint.mjs . --paralell
  
  
  /home/runner/work/promethean/promethean/packages/dlq/src/replay.ts
     4:8   error    Missing return type on function                                                       @typescript-eslint/explicit-module-boundary-types
     5:5   error    Argument 'store' should be typed with a non-any type                                  @typescript-eslint/explicit-module-boundary-types
     5:12  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     6:5   error    Argument 'bus' should be typed with a non-any type                                    @typescript-eslint/explicit-module-boundary-types
     6:10  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     8:5   warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
     8:5   warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
     8:68  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     8:76  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
    11:11  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    11:25  error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    11:31  error    Unsafe member access .scan on an `any` value                                          @typescript-eslint/no-unsafe-member-access
    12:5   warning  Unexpected loop, use map or reduce instead                                            functional/no-loop-statements
    13:15  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    13:26  error    Unsafe member access .payload on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    15:15  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    16:15  error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    16:19  error    Unsafe member access .publish on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    16:35  error    Unsafe member access .topic on an `any` value                                         @typescript-eslint/no-unsafe-member-access
    16:50  error    Unsafe member access .payload on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    17:13  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    17:30  error    Unsafe member access .headers on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    18:13  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    18:26  error    Unsafe member access .key on an `any` value                                           @typescript-eslint/no-unsafe-member-access
    19:13  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    19:26  error    Unsafe member access .sid on an `any` value                                           @typescript-eslint/no-unsafe-member-access
    20:13  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    20:24  error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    20:33  error    Unsafe member access .caused_by on an `any` value                                     @typescript-eslint/no-unsafe-member-access
    20:50  error    Unsafe member access .concat on an `any` value                                        @typescript-eslint/no-unsafe-member-access
    20:61  error    Unsafe member access .id on an `any` value                                            @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/dlq/src/subscribe.ts
     4:25   error    Argument 'bus' should be typed with a non-any type                                    @typescript-eslint/explicit-module-boundary-types
     4:30   error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     4:35   warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
     4:35   warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
     5:12   error    Missing return type on function                                                       @typescript-eslint/explicit-module-boundary-types
     5:72   error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     5:101  error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
     8:16   error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
     8:20   error    Unsafe member access .subscribe on an `any` value                                     @typescript-eslint/no-unsafe-member-access
    11:23   error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
    12:41   error    Unsafe argument of type `any` assigned to a parameter of type `string`                @typescript-eslint/no-unsafe-argument
    12:43   error    Unsafe member access .id on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    13:17   warning  Modifying a map is not allowed                                                        functional/immutable-data
    13:30   error    Unsafe argument of type `any` assigned to a parameter of type `string`                @typescript-eslint/no-unsafe-argument
    13:32   error    Unsafe member access .id on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    15:17   warning  Unexpected try-catch, this pattern is not functional                                  functional/no-try-statements
    17:21   warning  Modifying a map is not allowed                                                        functional/immutable-data
    17:37   error    Unsafe argument of type `any` assigned to a parameter of type `string`                @typescript-eslint/no-unsafe-argument
    17:39   error    Unsafe member access .id on an `any` value                                            @typescript-eslint/no-unsafe-member-access
    18:31   error    Unexpected any. Specify a different type                                              @typescript-eslint/no-explicit-any
    20:31   error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    20:35   error    Unsafe member access .publish on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    23:29   error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    24:46   error    Unsafe member access .stack on an `any` value                                         @typescript-eslint/no-unsafe-member-access
    24:60   error    Unsafe member access .message on an `any` value                                       @typescript-eslint/no-unsafe-member-access
    28:25   warning  Modifying a map is not allowed                                                        functional/immutable-data
    28:41   error    Unsafe argument of type `any` assigned to a parameter of type `string`                @typescript-eslint/no-unsafe-argument
    28:43   error    Unsafe member access .id on an `any` value                                            @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/dlq/src/types.ts
     4:15  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
    10:37  error  Missing return type on function           @typescript-eslint/explicit-module-boundary-types
  
  ✖ 61 problems (52 errors, 9 warnings)
  
❌ > nx run @promethean/tests:lint --paralell
  
  > node ../../tools/scripts/run-eslint.mjs . --paralell
  
  
  /home/runner/work/promethean/promethean/packages/tests/src/cephalon-transform.test.ts
    11:33  error  Unexpected any. Specify a different type      @typescript-eslint/no-explicit-any
    15:11  error  Unsafe assignment of an `any` value           @typescript-eslint/no-unsafe-assignment
    15:25  error  Unsafe call of a(n) `any` typed value         @typescript-eslint/no-unsafe-call
    16:11  error  Unsafe assignment of an `any` value           @typescript-eslint/no-unsafe-assignment
    16:20  error  Unsafe call of a(n) `any` typed value         @typescript-eslint/no-unsafe-call
    18:5   error  Unsafe call of a(n) `any` typed value         @typescript-eslint/no-unsafe-call
    18:7   error  Unsafe member access .is on an `any` value    @typescript-eslint/no-unsafe-member-access
    18:10  error  Unsafe call of a(n) `any` typed value         @typescript-eslint/no-unsafe-call
    18:17  error  Unsafe member access .trim on an `any` value  @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/tests/src/dev.harness.int.test.ts
    10:11  error  Unsafe assignment of an `any` value             @typescript-eslint/no-unsafe-assignment
    10:21  error  Unsafe call of a(n) `any` typed value           @typescript-eslint/no-unsafe-call
    13:11  error  Unsafe call of a(n) `any` typed value           @typescript-eslint/no-unsafe-call
    13:13  error  Unsafe member access .bus on an `any` value     @typescript-eslint/no-unsafe-member-access
    23:11  error  Unsafe assignment of an `any` value             @typescript-eslint/no-unsafe-assignment
    23:26  error  Unsafe call of a(n) `any` typed value           @typescript-eslint/no-unsafe-call
    23:28  error  Unsafe member access .bus on an `any` value     @typescript-eslint/no-unsafe-member-access
    24:17  error  Unsafe member access .length on an `any` value  @typescript-eslint/no-unsafe-member-access
    25:11  error  Unsafe assignment of an `any` value             @typescript-eslint/no-unsafe-assignment
    25:23  error  Unsafe call of a(n) `any` typed value           @typescript-eslint/no-unsafe-call
    25:25  error  Unsafe member access .bus on an `any` value     @typescript-eslint/no-unsafe-member-access
    28:11  error  Unsafe call of a(n) `any` typed value           @typescript-eslint/no-unsafe-call
    28:13  error  Unsafe member access .stop on an `any` value    @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/tests/src/fileExplorer.test.ts
    18:11  error  Unsafe assignment of an `any` value               @typescript-eslint/no-unsafe-assignment
    18:25  error  Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
    19:16  error  Unsafe member access .length on an `any` value    @typescript-eslint/no-unsafe-member-access
    20:14  error  Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
    20:20  error  Unsafe member access .find on an `any` value      @typescript-eslint/no-unsafe-member-access
    20:29  error  Unexpected any. Specify a different type          @typescript-eslint/no-explicit-any
    20:39  error  Unsafe member access .name on an `any` value      @typescript-eslint/no-unsafe-member-access
    20:65  error  Unsafe member access .type on an `any` value      @typescript-eslint/no-unsafe-member-access
    21:14  error  Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
    21:20  error  Unsafe member access .find on an `any` value      @typescript-eslint/no-unsafe-member-access
    21:29  error  Unexpected any. Specify a different type          @typescript-eslint/no-explicit-any
    21:39  error  Unsafe member access .name on an `any` value      @typescript-eslint/no-unsafe-member-access
    21:59  error  Unsafe member access .type on an `any` value      @typescript-eslint/no-unsafe-member-access
    26:11  error  Unsafe assignment of an `any` value               @typescript-eslint/no-unsafe-assignment
    26:27  error  Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
    28:31  error  Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
    33:11  error  Unsafe assignment of an `any` value               @typescript-eslint/no-unsafe-assignment
    33:27  error  Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
    34:12  error  Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
    34:20  error  Unsafe member access .some on an `any` value      @typescript-eslint/no-unsafe-member-access
    34:29  error  Unexpected any. Specify a different type          @typescript-eslint/no-explicit-any
    34:39  error  Unsafe member access .relative on an `any` value  @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/tests/src/integration.markdown.sync.test.ts
    22:11  error  Unsafe assignment of an `any` value                                                                                                                                               @typescript-eslint/no-unsafe-assignment
    22:25  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    22:39  error  Unsafe member access .load on an `any` value                                                                                                                                      @typescript-eslint/no-unsafe-member-access
    23:11  error  Unsafe assignment of an `any` value                                                                                                                                               @typescript-eslint/no-unsafe-assignment
    23:27  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    27:11  error  Unsafe assignment of an `any` value                                                                                                                                               @typescript-eslint/no-unsafe-assignment
    27:18  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    27:24  error  Unsafe member access .listCards on an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-member-access
    28:11  error  Unsafe assignment of an `any` value                                                                                                                                               @typescript-eslint/no-unsafe-assignment
    28:16  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    28:22  error  Unsafe member access .listCards on an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-member-access
    29:12  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    29:17  error  Unsafe member access .every on an `any` value                                                                                                                                     @typescript-eslint/no-unsafe-member-access
    29:27  error  Unexpected any. Specify a different type                                                                                                                                          @typescript-eslint/no-explicit-any
    29:35  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    29:37  error  Unsafe member access .tags on an `any` value                                                                                                                                      @typescript-eslint/no-unsafe-member-access
    30:12  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    30:15  error  Unsafe member access .every on an `any` value                                                                                                                                     @typescript-eslint/no-unsafe-member-access
    30:25  error  Unexpected any. Specify a different type                                                                                                                                          @typescript-eslint/no-explicit-any
    30:33  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    30:35  error  Unsafe member access .tags on an `any` value                                                                                                                                      @typescript-eslint/no-unsafe-member-access
    33:11  error  Unsafe assignment of an `any` value                                                                                                                                               @typescript-eslint/no-unsafe-assignment
    33:25  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    33:30  error  Unsafe member access .find on an `any` value                                                                                                                                      @typescript-eslint/no-unsafe-member-access
    33:39  error  Unexpected any. Specify a different type                                                                                                                                          @typescript-eslint/no-explicit-any
    33:49  error  Unsafe member access .id on an `any` value                                                                                                                                        @typescript-eslint/no-unsafe-member-access
    34:26  error  Unsafe member access .links on an `any` value                                                                                                                                     @typescript-eslint/no-unsafe-member-access
    34:47  error  Unsafe member access .links on an `any` value                                                                                                                                     @typescript-eslint/no-unsafe-member-access
    35:11  error  Unsafe assignment of an `any` value                                                                                                                                               @typescript-eslint/no-unsafe-assignment
    35:25  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    35:37  error  Unsafe member access .links on an `any` value                                                                                                                                     @typescript-eslint/no-unsafe-member-access
    35:57  error  Unsafe member access [0] on an `any` value                                                                                                                                        @typescript-eslint/no-unsafe-member-access
    36:40  error  Unsafe argument of type `any` assigned to a parameter of type `string`                                                                                                            @typescript-eslint/no-unsafe-argument
    47:11  error  Unsafe assignment of an `any` value                                                                                                                                               @typescript-eslint/no-unsafe-assignment
    47:25  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    47:31  error  Unsafe member access .toMarkdown on an `any` value                                                                                                                                @typescript-eslint/no-unsafe-member-access
    48:35  error  Unsafe argument of type `any` assigned to a parameter of type `string | ArrayBufferView | Iterable<string | ArrayBufferView> | AsyncIterable<string | ArrayBufferView> | Stream`  @typescript-eslint/no-unsafe-argument
    49:11  error  Unsafe assignment of an `any` value                                                                                                                                               @typescript-eslint/no-unsafe-assignment
    49:28  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    49:42  error  Unsafe member access .load on an `any` value                                                                                                                                      @typescript-eslint/no-unsafe-member-access
    51:12  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    51:12  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    51:21  error  Unsafe member access .listCards on an `any` value                                                                                                                                 @typescript-eslint/no-unsafe-member-access
    51:39  error  Unsafe member access .every on an `any` value                                                                                                                                     @typescript-eslint/no-unsafe-member-access
    51:49  error  Unexpected any. Specify a different type                                                                                                                                          @typescript-eslint/no-explicit-any
    51:57  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    51:59  error  Unsafe member access .tags on an `any` value                                                                                                                                      @typescript-eslint/no-unsafe-member-access
    60:11  error  Unsafe assignment of an `any` value                                                                                                                                               @typescript-eslint/no-unsafe-assignment
    60:25  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    60:39  error  Unsafe member access .load on an `any` value                                                                                                                                      @typescript-eslint/no-unsafe-member-access
    61:11  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    62:11  error  Unsafe assignment of an `any` value                                                                                                                                               @typescript-eslint/no-unsafe-assignment
    62:27  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    62:33  error  Unsafe member access .toMarkdown on an `any` value                                                                                                                                @typescript-eslint/no-unsafe-member-access
    65:11  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    66:11  error  Unsafe assignment of an `any` value                                                                                                                                               @typescript-eslint/no-unsafe-assignment
    66:28  error  Unsafe call of a(n) `any` typed value                                                                                                                                             @typescript-eslint/no-unsafe-call
    66:34  error  Unsafe member access .toMarkdown on an `any` value                                                                                                                                @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/tests/src/kanban.test.ts
     17:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
     17:25  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     17:39  error  Unsafe member access .load on an `any` value          @typescript-eslint/no-unsafe-member-access
     18:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
     18:21  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     18:27  error  Unsafe member access .listColumns on an `any` value   @typescript-eslint/no-unsafe-member-access
     20:9   error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     20:17  error  Unsafe member access .map on an `any` value           @typescript-eslint/no-unsafe-member-access
     20:25  error  Unexpected any. Specify a different type              @typescript-eslint/no-explicit-any
     20:35  error  Unsafe member access .name on an `any` value          @typescript-eslint/no-unsafe-member-access
     26:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
     26:25  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     26:39  error  Unsafe member access .load on an `any` value          @typescript-eslint/no-unsafe-member-access
     27:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
     27:23  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     27:29  error  Unsafe member access .listCards on an `any` value     @typescript-eslint/no-unsafe-member-access
     28:20  error  Unsafe member access .length on an `any` value        @typescript-eslint/no-unsafe-member-access
     29:22  error  Unsafe member access [0] on an `any` value            @typescript-eslint/no-unsafe-member-access
     37:22  error  Unsafe member access [1] on an `any` value            @typescript-eslint/no-unsafe-member-access
     45:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
     45:25  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     45:39  error  Unsafe member access .load on an `any` value          @typescript-eslint/no-unsafe-member-access
     46:5   error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     46:11  error  Unsafe member access .addColumn on an `any` value     @typescript-eslint/no-unsafe-member-access
     48:9   error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     48:9   error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     48:9   error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     49:14  error  Unsafe member access .listColumns on an `any` value   @typescript-eslint/no-unsafe-member-access
     50:14  error  Unsafe member access .map on an `any` value           @typescript-eslint/no-unsafe-member-access
     50:22  error  Unexpected any. Specify a different type              @typescript-eslint/no-explicit-any
     50:32  error  Unsafe member access .name on an `any` value          @typescript-eslint/no-unsafe-member-access
     51:14  error  Unsafe member access .includes on an `any` value      @typescript-eslint/no-unsafe-member-access
     53:5   error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     53:11  error  Unsafe member access .removeColumn on an `any` value  @typescript-eslint/no-unsafe-member-access
     55:9   error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     55:9   error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     55:9   error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     56:14  error  Unsafe member access .listColumns on an `any` value   @typescript-eslint/no-unsafe-member-access
     57:14  error  Unsafe member access .map on an `any` value           @typescript-eslint/no-unsafe-member-access
     57:22  error  Unexpected any. Specify a different type              @typescript-eslint/no-explicit-any
     57:32  error  Unsafe member access .name on an `any` value          @typescript-eslint/no-unsafe-member-access
     58:14  error  Unsafe member access .includes on an `any` value      @typescript-eslint/no-unsafe-member-access
     63:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
     63:25  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     63:39  error  Unsafe member access .load on an `any` value          @typescript-eslint/no-unsafe-member-access
     64:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
     64:19  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     64:25  error  Unsafe member access .addCard on an `any` value       @typescript-eslint/no-unsafe-member-access
     65:5   error  Unexpected let, use const instead                     functional/no-let
     65:9   error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
     65:21  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     65:27  error  Unsafe member access .listCards on an `any` value     @typescript-eslint/no-unsafe-member-access
     66:12  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     66:22  error  Unsafe member access .some on an `any` value          @typescript-eslint/no-unsafe-member-access
     66:31  error  Unexpected any. Specify a different type              @typescript-eslint/no-explicit-any
     66:41  error  Unsafe member access .id on an `any` value            @typescript-eslint/no-unsafe-member-access
     68:5   error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     68:11  error  Unsafe member access .removeCard on an `any` value    @typescript-eslint/no-unsafe-member-access
     69:5   error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
     69:17  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     69:23  error  Unsafe member access .listCards on an `any` value     @typescript-eslint/no-unsafe-member-access
     70:13  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     70:23  error  Unsafe member access .some on an `any` value          @typescript-eslint/no-unsafe-member-access
     70:32  error  Unexpected any. Specify a different type              @typescript-eslint/no-explicit-any
     70:42  error  Unsafe member access .id on an `any` value            @typescript-eslint/no-unsafe-member-access
     73:5   error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     73:11  error  Unsafe member access .moveCard on an `any` value      @typescript-eslint/no-unsafe-member-access
     74:12  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     74:12  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     74:18  error  Unsafe member access .listCards on an `any` value     @typescript-eslint/no-unsafe-member-access
     74:36  error  Unsafe member access .some on an `any` value          @typescript-eslint/no-unsafe-member-access
     74:45  error  Unexpected any. Specify a different type              @typescript-eslint/no-explicit-any
     74:55  error  Unsafe member access .id on an `any` value            @typescript-eslint/no-unsafe-member-access
     75:13  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     75:13  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     75:19  error  Unsafe member access .listCards on an `any` value     @typescript-eslint/no-unsafe-member-access
     75:38  error  Unsafe member access .some on an `any` value          @typescript-eslint/no-unsafe-member-access
     75:47  error  Unexpected any. Specify a different type              @typescript-eslint/no-explicit-any
     75:57  error  Unsafe member access .id on an `any` value            @typescript-eslint/no-unsafe-member-access
     78:5   error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     78:11  error  Unsafe member access .updateCard on an `any` value    @typescript-eslint/no-unsafe-member-access
     79:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
     79:21  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     79:21  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     79:27  error  Unsafe member access .listCards on an `any` value     @typescript-eslint/no-unsafe-member-access
     79:45  error  Unsafe member access .find on an `any` value          @typescript-eslint/no-unsafe-member-access
     79:54  error  Unexpected any. Specify a different type              @typescript-eslint/no-explicit-any
     79:64  error  Unsafe member access .id on an `any` value            @typescript-eslint/no-unsafe-member-access
     80:19  error  Unsafe member access .text on an `any` value          @typescript-eslint/no-unsafe-member-access
     81:21  error  Unsafe member access .done on an `any` value          @typescript-eslint/no-unsafe-member-access
     82:12  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     82:21  error  Unsafe member access .tags on an `any` value          @typescript-eslint/no-unsafe-member-access
     86:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
     86:25  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     86:39  error  Unsafe member access .load on an `any` value          @typescript-eslint/no-unsafe-member-access
     87:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
     87:19  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     87:25  error  Unsafe member access .findCards on an `any` value     @typescript-eslint/no-unsafe-member-access
     88:16  error  Unsafe member access .length on an `any` value        @typescript-eslint/no-unsafe-member-access
     89:16  error  Unsafe member access [0] on an `any` value            @typescript-eslint/no-unsafe-member-access
     90:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
     90:23  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     90:29  error  Unsafe member access .findCards on an `any` value     @typescript-eslint/no-unsafe-member-access
     91:20  error  Unsafe member access .length on an `any` value        @typescript-eslint/no-unsafe-member-access
     92:20  error  Unsafe member access [0] on an `any` value            @typescript-eslint/no-unsafe-member-access
     96:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
     96:25  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     96:39  error  Unsafe member access .load on an `any` value          @typescript-eslint/no-unsafe-member-access
     97:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
     97:22  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     97:28  error  Unsafe member access .toMarkdown on an `any` value    @typescript-eslint/no-unsafe-member-access
     99:12  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     99:15  error  Unsafe member access .includes on an `any` value      @typescript-eslint/no-unsafe-member-access
    100:12  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    100:15  error  Unsafe member access .includes on an `any` value      @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/tests/src/markdown.kanban.helpers.test.ts
     6:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
     6:25  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     6:39  error  Unsafe member access .load on an `any` value                            @typescript-eslint/no-unsafe-member-access
     7:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
     7:19  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     7:25  error  Unsafe member access .listCards on an `any` value                       @typescript-eslint/no-unsafe-member-access
     8:16  error  Unsafe member access .length on an `any` value                          @typescript-eslint/no-unsafe-member-access
     9:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
     9:21  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
    10:12  error  Unsafe member access .id on an `any` value                              @typescript-eslint/no-unsafe-member-access
    11:12  error  Unsafe member access .text on an `any` value                            @typescript-eslint/no-unsafe-member-access
    12:15  error  Unsafe member access .done on an `any` value                            @typescript-eslint/no-unsafe-member-access
    13:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    13:14  error  Unsafe member access .tags on an `any` value                            @typescript-eslint/no-unsafe-member-access
    14:12  error  Unsafe member access .links on an `any` value                           @typescript-eslint/no-unsafe-member-access
    19:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    19:25  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    19:39  error  Unsafe member access .load on an `any` value                            @typescript-eslint/no-unsafe-member-access
    20:5   error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    20:11  error  Unsafe member access .updateCard on an `any` value                      @typescript-eslint/no-unsafe-member-access
    21:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    21:15  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    21:21  error  Unsafe member access .listCards on an `any` value                       @typescript-eslint/no-unsafe-member-access
    21:39  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
    22:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    22:14  error  Unsafe member access .tags on an `any` value                            @typescript-eslint/no-unsafe-member-access
    23:12  error  Unsafe member access .links on an `any` value                           @typescript-eslint/no-unsafe-member-access
    24:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    24:23  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    24:29  error  Unsafe member access .toMarkdown on an `any` value                      @typescript-eslint/no-unsafe-member-access
    25:36  error  Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument
    26:25  error  Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument
    31:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    31:25  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    31:39  error  Unsafe member access .load on an `any` value                            @typescript-eslint/no-unsafe-member-access
    32:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    32:16  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    32:22  error  Unsafe member access .addCard on an `any` value                         @typescript-eslint/no-unsafe-member-access
    33:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    33:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    33:18  error  Unsafe member access .listCards on an `any` value                       @typescript-eslint/no-unsafe-member-access
    33:36  error  Unsafe member access .some on an `any` value                            @typescript-eslint/no-unsafe-member-access
    33:45  error  Unexpected any. Specify a different type                                @typescript-eslint/no-explicit-any
    33:55  error  Unsafe member access .id on an `any` value                              @typescript-eslint/no-unsafe-member-access
    34:5   error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    34:11  error  Unsafe member access .removeCard on an `any` value                      @typescript-eslint/no-unsafe-member-access
    35:13  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    35:13  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    35:19  error  Unsafe member access .listCards on an `any` value                       @typescript-eslint/no-unsafe-member-access
    35:37  error  Unsafe member access .some on an `any` value                            @typescript-eslint/no-unsafe-member-access
    35:46  error  Unexpected any. Specify a different type                                @typescript-eslint/no-explicit-any
    35:56  error  Unsafe member access .id on an `any` value                              @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/tests/src/markdown.sync.helpers.test.ts
     25:10  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     26:10  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     31:10  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     31:34  error  Unexpected any. Specify a different type                                @typescript-eslint/no-explicit-any
     33:10  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     33:35  error  Unexpected any. Specify a different type                                @typescript-eslint/no-explicit-any
     38:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
     38:18  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     38:45  error  Unexpected any. Specify a different type                                @typescript-eslint/no-explicit-any
     39:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     39:17  error  Unsafe member access .tags on an `any` value                            @typescript-eslint/no-unsafe-member-access
     40:13  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     40:18  error  Unsafe member access .tags on an `any` value                            @typescript-eslint/no-unsafe-member-access
     41:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     41:17  error  Unsafe member access .tags on an `any` value                            @typescript-eslint/no-unsafe-member-access
     46:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     46:40  error  Unexpected any. Specify a different type                                @typescript-eslint/no-explicit-any
     48:13  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     48:41  error  Unexpected any. Specify a different type                                @typescript-eslint/no-explicit-any
     50:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     50:40  error  Unexpected any. Specify a different type                                @typescript-eslint/no-explicit-any
     55:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     55:32  error  Unexpected any. Specify a different type                                @typescript-eslint/no-explicit-any
     57:13  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     57:33  error  Unexpected any. Specify a different type                                @typescript-eslint/no-explicit-any
     62:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
     62:25  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     64:49  error  Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument
     70:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
     70:25  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     70:39  error  Unsafe member access .load on an `any` value                            @typescript-eslint/no-unsafe-member-access
     71:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
     71:18  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     71:24  error  Unsafe member access .listCards on an `any` value                       @typescript-eslint/no-unsafe-member-access
     71:42  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
     72:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
     72:27  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     74:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
     74:19  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     74:25  error  Unsafe member access .listCards on an `any` value                       @typescript-eslint/no-unsafe-member-access
     74:43  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
     75:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     75:18  error  Unsafe member access .tags on an `any` value                            @typescript-eslint/no-unsafe-member-access
     81:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
     81:25  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     81:39  error  Unsafe member access .load on an `any` value                            @typescript-eslint/no-unsafe-member-access
     82:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
     82:18  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     82:24  error  Unsafe member access .listCards on an `any` value                       @typescript-eslint/no-unsafe-member-access
     82:42  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
     83:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
     83:27  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     85:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
     85:19  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     85:25  error  Unsafe member access .listCards on an `any` value                       @typescript-eslint/no-unsafe-member-access
     85:43  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
     86:20  error  Unsafe member access .links on an `any` value                           @typescript-eslint/no-unsafe-member-access
     86:35  error  Unsafe member access .links on an `any` value                           @typescript-eslint/no-unsafe-member-access
     87:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
     87:18  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     87:24  error  Unsafe member access .links on an `any` value                           @typescript-eslint/no-unsafe-member-access
     87:44  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
     88:48  error  Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument
     96:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
     96:25  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     96:39  error  Unsafe member access .load on an `any` value                            @typescript-eslint/no-unsafe-member-access
     97:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
     97:18  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
     97:24  error  Unsafe member access .listCards on an `any` value                       @typescript-eslint/no-unsafe-member-access
     97:42  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
     98:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
     98:27  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    106:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    106:25  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    106:39  error  Unsafe member access .load on an `any` value                            @typescript-eslint/no-unsafe-member-access
    107:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    114:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    114:25  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    114:39  error  Unsafe member access .load on an `any` value                            @typescript-eslint/no-unsafe-member-access
    115:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    115:27  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    117:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    117:18  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    117:24  error  Unsafe member access .listCards on an `any` value                       @typescript-eslint/no-unsafe-member-access
    117:42  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
    118:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    118:17  error  Unsafe member access .tags on an `any` value                            @typescript-eslint/no-unsafe-member-access
    125:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    125:25  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    125:39  error  Unsafe member access .load on an `any` value                            @typescript-eslint/no-unsafe-member-access
    127:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    127:18  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    127:24  error  Unsafe member access .listCards on an `any` value                       @typescript-eslint/no-unsafe-member-access
    127:42  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
    128:11  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    129:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    129:20  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    129:26  error  Unsafe member access .listCards on an `any` value                       @typescript-eslint/no-unsafe-member-access
    129:44  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
    130:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    130:19  error  Unsafe member access .tags on an `any` value                            @typescript-eslint/no-unsafe-member-access
    131:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    131:29  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    131:35  error  Unsafe member access .toMarkdown on an `any` value                      @typescript-eslint/no-unsafe-member-access
    132:11  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    133:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    133:19  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    133:25  error  Unsafe member access .listCards on an `any` value                       @typescript-eslint/no-unsafe-member-access
    133:43  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
    134:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    134:18  error  Unsafe member access .tags on an `any` value                            @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/tests/src/markdown.sync.test.ts
    21:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    21:25  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    21:39  error  Unsafe member access .load on an `any` value                            @typescript-eslint/no-unsafe-member-access
    22:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    22:27  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    26:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    26:18  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    26:24  error  Unsafe member access .listCards on an `any` value                       @typescript-eslint/no-unsafe-member-access
    27:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    27:16  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    27:22  error  Unsafe member access .listCards on an `any` value                       @typescript-eslint/no-unsafe-member-access
    28:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    28:17  error  Unsafe member access .every on an `any` value                           @typescript-eslint/no-unsafe-member-access
    28:27  error  Unexpected any. Specify a different type                                @typescript-eslint/no-explicit-any
    28:35  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    28:37  error  Unsafe member access .tags on an `any` value                            @typescript-eslint/no-unsafe-member-access
    29:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    29:15  error  Unsafe member access .every on an `any` value                           @typescript-eslint/no-unsafe-member-access
    29:25  error  Unexpected any. Specify a different type                                @typescript-eslint/no-explicit-any
    29:33  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    29:35  error  Unsafe member access .tags on an `any` value                            @typescript-eslint/no-unsafe-member-access
    32:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    32:25  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    32:30  error  Unsafe member access .find on an `any` value                            @typescript-eslint/no-unsafe-member-access
    32:39  error  Unexpected any. Specify a different type                                @typescript-eslint/no-explicit-any
    32:49  error  Unsafe member access .id on an `any` value                              @typescript-eslint/no-unsafe-member-access
    33:26  error  Unsafe member access .links on an `any` value                           @typescript-eslint/no-unsafe-member-access
    33:47  error  Unsafe member access .links on an `any` value                           @typescript-eslint/no-unsafe-member-access
    34:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    34:25  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    34:37  error  Unsafe member access .links on an `any` value                           @typescript-eslint/no-unsafe-member-access
    34:57  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
    35:40  error  Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument
    51:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    51:25  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    51:39  error  Unsafe member access .load on an `any` value                            @typescript-eslint/no-unsafe-member-access
    52:11  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    53:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    53:18  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    53:24  error  Unsafe member access .listCards on an `any` value                       @typescript-eslint/no-unsafe-member-access
    54:15  error  Unsafe member access .length on an `any` value                          @typescript-eslint/no-unsafe-member-access
    55:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    55:17  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
    56:13  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    56:18  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
    65:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    65:25  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    65:39  error  Unsafe member access .load on an `any` value                            @typescript-eslint/no-unsafe-member-access
    66:11  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    67:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    67:18  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    67:24  error  Unsafe member access .listCards on an `any` value                       @typescript-eslint/no-unsafe-member-access
    68:15  error  Unsafe member access .length on an `any` value                          @typescript-eslint/no-unsafe-member-access
    69:12  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    69:17  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
    70:19  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
    70:36  error  Unsafe member access [0] on an `any` value                              @typescript-eslint/no-unsafe-member-access
    80:11  error  Unsafe assignment of an `any` value                                     @typescript-eslint/no-unsafe-assignment
    80:25  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
    80:39  error  Unsafe member access .load on an `any` value                            @typescript-eslint/no-unsafe-member-access
    81:11  error  Unsafe call of a(n) `any` typed value                                   @typescript-eslint/no-unsafe-call
  
  /home/runner/work/promethean/promethean/packages/tests/src/markdown.task.test.ts
     9:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
     9:24  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
     9:37  error  Unsafe member access .load on an `any` value          @typescript-eslint/no-unsafe-member-access
    10:10  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    10:15  error  Unsafe member access .getId on an `any` value         @typescript-eslint/no-unsafe-member-access
    11:10  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    11:15  error  Unsafe member access .getTitle on an `any` value      @typescript-eslint/no-unsafe-member-access
    12:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
    12:18  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    12:23  error  Unsafe member access .getHashtags on an `any` value   @typescript-eslint/no-unsafe-member-access
    13:12  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    13:17  error  Unsafe member access .includes on an `any` value      @typescript-eslint/no-unsafe-member-access
    14:12  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    14:17  error  Unsafe member access .includes on an `any` value      @typescript-eslint/no-unsafe-member-access
    18:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
    18:24  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    18:37  error  Unsafe member access .load on an `any` value          @typescript-eslint/no-unsafe-member-access
    19:10  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    19:15  error  Unsafe member access .getId on an `any` value         @typescript-eslint/no-unsafe-member-access
    20:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
    20:16  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    20:21  error  Unsafe member access .ensureId on an `any` value      @typescript-eslint/no-unsafe-member-access
    22:10  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    22:15  error  Unsafe member access .getId on an `any` value         @typescript-eslint/no-unsafe-member-access
    23:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
    23:23  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    23:28  error  Unsafe member access .toMarkdown on an `any` value    @typescript-eslint/no-unsafe-member-access
    24:12  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    24:16  error  Unsafe member access .includes on an `any` value      @typescript-eslint/no-unsafe-member-access
    28:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
    28:24  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    28:37  error  Unsafe member access .load on an `any` value          @typescript-eslint/no-unsafe-member-access
    29:5   error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    29:10  error  Unsafe member access .ensureStatus on an `any` value  @typescript-eslint/no-unsafe-member-access
    30:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
    30:23  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    30:28  error  Unsafe member access .toMarkdown on an `any` value    @typescript-eslint/no-unsafe-member-access
    31:12  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    31:12  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    31:16  error  Unsafe member access .trimEnd on an `any` value       @typescript-eslint/no-unsafe-member-access
    31:26  error  Unsafe member access .endsWith on an `any` value      @typescript-eslint/no-unsafe-member-access
    32:13  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    32:17  error  Unsafe member access .includes on an `any` value      @typescript-eslint/no-unsafe-member-access
    36:11  error  Unsafe assignment of an `any` value                   @typescript-eslint/no-unsafe-assignment
    36:24  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    36:37  error  Unsafe member access .load on an `any` value          @typescript-eslint/no-unsafe-member-access
    37:10  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    37:15  error  Unsafe member access .getTitle on an `any` value      @typescript-eslint/no-unsafe-member-access
    38:5   error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    38:10  error  Unsafe member access .setTitle on an `any` value      @typescript-eslint/no-unsafe-member-access
    39:10  error  Unsafe call of a(n) `any` typed value                 @typescript-eslint/no-unsafe-call
    39:15  error  Unsafe member access .getTitle on an `any` value      @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/tests/src/parity/normalizers.test.ts
    11:17  error  Unsafe call of a(n) `any` typed value  @typescript-eslint/no-unsafe-call
    20:17  error  Unsafe call of a(n) `any` typed value  @typescript-eslint/no-unsafe-call
    25:17  error  Unsafe call of a(n) `any` typed value  @typescript-eslint/no-unsafe-call
    33:17  error  Unsafe call of a(n) `any` typed value  @typescript-eslint/no-unsafe-call
  
  /home/runner/work/promethean/promethean/packages/tests/src/parity/runner.test.ts
     9:36  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
     9:54  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
    21:36  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
    21:54  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
    32:11  error  Unsafe assignment of an `any` value       @typescript-eslint/no-unsafe-assignment
    32:23  error  Unsafe call of a(n) `any` typed value     @typescript-eslint/no-unsafe-call
    40:11  error  Unsafe assignment of an `any` value       @typescript-eslint/no-unsafe-assignment
    40:23  error  Unsafe call of a(n) `any` typed value     @typescript-eslint/no-unsafe-call
    48:11  error  Unsafe assignment of an `any` value       @typescript-eslint/no-unsafe-assignment
    48:23  error  Unsafe call of a(n) `any` typed value     @typescript-eslint/no-unsafe-call
    56:11  error  Unsafe assignment of an `any` value       @typescript-eslint/no-unsafe-assignment
    56:17  error  Unsafe call of a(n) `any` typed value     @typescript-eslint/no-unsafe-call
  
  /home/runner/work/promethean/promethean/packages/tests/src/stream-title.test.ts
    17:7   warning  Variable should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")   functional/prefer-immutable-types
    24:16  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
    24:16  warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
    27:5   warning  Modifying an existing object/array is not allowed                                     functional/immutable-data
    33:11  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    33:25  error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    36:5   warning  Modifying an existing object/array is not allowed                                     functional/immutable-data
    41:16  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
    41:16  warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
    44:5   warning  Modifying an existing object/array is not allowed                                     functional/immutable-data
    46:31  error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    48:5   warning  Modifying an existing object/array is not allowed                                     functional/immutable-data
    53:16  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
    53:16  warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
    56:5   warning  Modifying an existing object/array is not allowed                                     functional/immutable-data
    61:11  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    61:19  error    Unsafe construction of a(n) `any` typed value                                         @typescript-eslint/no-unsafe-call
    63:11  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    63:25  error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    65:23  error    Unsafe member access .titles on an `any` value                                        @typescript-eslint/no-unsafe-member-access
    67:5   warning  Modifying an existing object/array is not allowed                                     functional/immutable-data
    72:16  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")  functional/prefer-immutable-types
    72:16  warning  Parameter should be a read only type                                                  @typescript-eslint/prefer-readonly-parameter-types
    75:5   warning  Modifying an existing object/array is not allowed                                     functional/immutable-data
    80:11  error    Unsafe assignment of an `any` value                                                   @typescript-eslint/no-unsafe-assignment
    80:19  error    Unsafe construction of a(n) `any` typed value                                         @typescript-eslint/no-unsafe-call
    83:5   error    Unsafe call of a(n) `any` typed value                                                 @typescript-eslint/no-unsafe-call
    87:23  error    Unsafe member access .titles on an `any` value                                        @typescript-eslint/no-unsafe-member-access
    89:5   warning  Modifying an existing object/array is not allowed                                     functional/immutable-data
  
  /home/runner/work/promethean/promethean/packages/tests/src/transformer.test.ts
      8:11  error    Unsafe assignment of an `any` value               @typescript-eslint/no-unsafe-assignment
      8:25  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
     17:11  error    Unsafe assignment of an `any` value               @typescript-eslint/no-unsafe-assignment
     17:20  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
     19:12  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
     19:19  error    Unsafe member access .includes on an `any` value  @typescript-eslint/no-unsafe-member-access
     20:13  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
     20:20  error    Unsafe member access .includes on an `any` value  @typescript-eslint/no-unsafe-member-access
     29:11  error    Unsafe assignment of an `any` value               @typescript-eslint/no-unsafe-assignment
     29:25  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
     38:11  error    Unsafe assignment of an `any` value               @typescript-eslint/no-unsafe-assignment
     38:20  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
     40:12  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
     40:19  error    Unsafe member access .includes on an `any` value  @typescript-eslint/no-unsafe-member-access
     41:13  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
     41:20  error    Unsafe member access .includes on an `any` value  @typescript-eslint/no-unsafe-member-access
     50:11  error    Unsafe assignment of an `any` value               @typescript-eslint/no-unsafe-assignment
     50:25  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
     60:11  error    Unsafe assignment of an `any` value               @typescript-eslint/no-unsafe-assignment
     60:20  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
     62:11  error    Unsafe assignment of an `any` value               @typescript-eslint/no-unsafe-assignment
     62:20  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
     62:27  error    Unsafe member access .match on an `any` value     @typescript-eslint/no-unsafe-member-access
     62:61  error    Unsafe member access .length on an `any` value    @typescript-eslint/no-unsafe-member-access
     72:11  error    Unsafe assignment of an `any` value               @typescript-eslint/no-unsafe-assignment
     72:25  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
     83:11  error    Unsafe assignment of an `any` value               @typescript-eslint/no-unsafe-assignment
     83:20  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
     85:13  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
     85:20  error    Unsafe member access .includes on an `any` value  @typescript-eslint/no-unsafe-member-access
     86:12  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
     86:19  error    Unsafe member access .includes on an `any` value  @typescript-eslint/no-unsafe-member-access
    123:1   warning  Unexpected loop, use map or reduce instead        functional/no-loop-statements
    125:15  error    Unsafe assignment of an `any` value               @typescript-eslint/no-unsafe-assignment
    125:29  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
    126:15  error    Unsafe assignment of an `any` value               @typescript-eslint/no-unsafe-assignment
    126:24  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
    127:16  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
    127:23  error    Unsafe member access .includes on an `any` value  @typescript-eslint/no-unsafe-member-access
    171:1   warning  Unexpected loop, use map or reduce instead        functional/no-loop-statements
    173:15  error    Unsafe assignment of an `any` value               @typescript-eslint/no-unsafe-assignment
    173:29  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
    174:15  error    Unsafe assignment of an `any` value               @typescript-eslint/no-unsafe-assignment
    174:24  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
    175:16  error    Unsafe call of a(n) `any` typed value             @typescript-eslint/no-unsafe-call
    175:23  error    Unsafe member access .includes on an `any` value  @typescript-eslint/no-unsafe-member-access
  
  /home/runner/work/promethean/promethean/packages/tests/src/url.test.ts
     5:11  error  Unsafe assignment of an `any` value    @typescript-eslint/no-unsafe-assignment
     5:24  error  Unsafe call of a(n) `any` typed value  @typescript-eslint/no-unsafe-call
    10:11  error  Unsafe assignment of an `any` value    @typescript-eslint/no-unsafe-assignment
    10:24  error  Unsafe call of a(n) `any` typed value  @typescript-eslint/no-unsafe-call
    15:11  error  Unsafe assignment of an `any` value    @typescript-eslint/no-unsafe-assignment
    15:16  error  Unsafe call of a(n) `any` typed value  @typescript-eslint/no-unsafe-call
    16:11  error  Unsafe assignment of an `any` value    @typescript-eslint/no-unsafe-assignment
    16:16  error  Unsafe call of a(n) `any` typed value  @typescript-eslint/no-unsafe-call
    21:13  error  Unsafe call of a(n) `any` typed value  @typescript-eslint/no-unsafe-call
    22:13  error  Unsafe call of a(n) `any` typed value  @typescript-eslint/no-unsafe-call
    23:12  error  Unsafe call of a(n) `any` typed value  @typescript-eslint/no-unsafe-call
  
  ✖ 595 problems (576 errors, 19 warnings)
  
❌ > nx run @promethean/projectors:lint --paralell
  
  > node ../../tools/scripts/run-eslint.mjs . --paralell
  
  
  /home/runner/work/promethean/promethean/packages/projectors/src/transactional.ts
     6:34  error    Unexpected any. Specify a different type                                                      @typescript-eslint/no-explicit-any
     9:15  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")          functional/prefer-immutable-types
     9:15  warning  Parameter should be a read only type                                                          @typescript-eslint/prefer-readonly-parameter-types
     9:34  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "ReadonlyShallow")  functional/prefer-immutable-types
     9:34  warning  Parameter should be a read only type                                                          @typescript-eslint/prefer-readonly-parameter-types
     9:42  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")          functional/prefer-immutable-types
     9:42  warning  Parameter should be a read only type                                                          @typescript-eslint/prefer-readonly-parameter-types
    14:8   error    Missing return type on function                                                               @typescript-eslint/explicit-module-boundary-types
    14:55  error    Unexpected any. Specify a different type                                                      @typescript-eslint/no-explicit-any
    14:60  warning  Parameter should be a read only type                                                          @typescript-eslint/prefer-readonly-parameter-types
    14:75  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "ReadonlyShallow")  functional/prefer-immutable-types
    14:75  warning  Parameter should be a read only type                                                          @typescript-eslint/prefer-readonly-parameter-types
    14:83  warning  Parameter should have an immutability of at least "ReadonlyDeep" (actual: "Mutable")          functional/prefer-immutable-types
    14:83  warning  Parameter should be a read only type                                                          @typescript-eslint/prefer-readonly-parameter-types
    24:27  error    Unsafe assignment of an error typed value                                                     @typescript-eslint/no-unsafe-assignment
    24:31  error    Unsafe call of a(n) `error` type typed value                                                  @typescript-eslint/no-unsafe-call
    24:41  error    Unsafe member access .startSession on an `error` typed value                                  @typescript-eslint/no-unsafe-member-access
    25:21  warning  Unexpected try-finally, this pattern is not functional                                        functional/no-try-statements
    26:31  error    Unsafe call of a(n) `error` type typed value                                                  @typescript-eslint/no-unsafe-call
    26:33  error    Unsafe member access .withTransaction on an `error` typed value                               @typescript-eslint/no-unsafe-member-access
    28:59  error    Unsafe argument of type error typed assigned to a parameter of type `ClientSession`           @typescript-eslint/no-unsafe-argument
    33:31  error    Unsafe call of a(n) `error` type typed value                                                  @typescript-eslint/no-unsafe-call
    33:33  error    Unsafe member access .endSession on an `error` typed value                                    @typescript-eslint/no-unsafe-member-access
    40:31  error    Unsafe assignment of an `any` value                                                           @typescript-eslint/no-unsafe-assignment
    40:79  error    Unexpected any. Specify a different type                                                      @typescript-eslint/no-explicit-any
    40:85  error    Unsafe member access .errorLabels on an `any` value                                           @typescript-eslint/no-unsafe-member-access
  
  ✖ 26 problems (14 errors, 12 warnings)
  


 NX   Running target lint for 13 projects failed

Failed tasks:

- @promethean/examples:lint
- @promethean/ws:lint
- @promethean/http:lint
- @promethean/schema:lint
- @promethean/timetravel:lint
- @promethean/discord:lint
- @promethean/compaction:lint
- @promethean/dlq:lint
- @promethean/tests:lint
- @promethean/projectors:lint

Error: Process completed with exit code 1.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
