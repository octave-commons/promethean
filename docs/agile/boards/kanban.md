---
kanban-plugin: board
---

## Rejected

- [ ] [Add **startChangelogProjector** for any compaction-like topic you want live-queryable](../tasks/add_startchangelogprojector_for_any_compaction_lik_md.md) #rejected
- [ ] [Add Prometheus `events_*` counters in WS server hook points](../tasks/add_prometheus_events_counters_in_ws_server_hook_p_md.md) #rejected
- [ ] [Add TTLs per topic via migration script](../tasks/add_ttls_per_topic_via_migration_script_md.md) #rejected
- [ ] [Add `/lag` checks to CI smoke (ensure small lag after publishing bursts)](../tasks/add_lag_checks_to_ci_smoke_ensure_small_lag_after_md.md) #rejected
- [ ] [Add `/ops` endpoint to list **partition assignments** (optional: dump coordinator state)](../tasks/add_ops_endpoint_to_list_partition_assignments_opt_md.md) #rejected
- [ ] [Add `MongoDedupe` and replace critical consumers with `subscribeExactlyOnce`](../tasks/add_mongodedupe_and_replace_critical_consumers_wit_md.md) #rejected
- [ ] [Add `MongoOutbox` to any service that writes DB changes; swap local app emits → outbox writes](../tasks/add_mongooutbox_to_any_service_that_writes_db_chan_md.md) #rejected
- [ ] [Add `TokenBucket` to WS server (conn + per-topic)](../tasks/add_tokenbucket_to_ws_server_conn_per_topic_md.md) #rejected
- [ ] [Add `dev.harness.int.test.ts` to CI integration stage](../tasks/add_dev_harness_int_test_ts_to_ci_integration_stag_md.md) #rejected
- [ ] [Add `manualAck` to event bus and re-run tests](../tasks/add_manualack_to_event_bus_and_re_run_tests_md.md) #rejected
- [ ] [Add `process.txn` projector to upsert `processes` + `host_stats` atomically](../tasks/add_process_txn_projector_to_upsert_processes_host_md.md) #rejected
- [ ] [Add snapshot consumer to warm cache on boot](../tasks/add_snapshot_consumer_to_warm_cache_on_boot_md.md) #rejected
- [ ] [Add vault instructions to main README.md](../tasks/add_vault_instructions_to_main_readme_md_md_md.md) #rejected
- [ ] [Define default scopes: `publish:heartbeat.received`, `subscribe:process.state`](../tasks/define_default_scopes_publish_heartbeat_received_s_md.md) #rejected
- [ ] [Deploy **changefeed** for collections you want mirrored to topics](../tasks/deploy_changefeed_for_collections_you_want_mirrore_md.md) #rejected
- [ ] [Detect contradictions in memory #codex-task](../tasks/detect_contradictions_in_memory_codex_task_md.md) #rejected
- [ ] [Document ETag semantics and cache headers for `/snap/:key`](../tasks/document_etag_semantics_and_cache_headers_for_snap_md.md) #rejected
- [ ] [Enable **scripts/lint-topics.ts** in CI](../tasks/enable_scripts_lint_topics_ts_in_ci_md.md) #rejected
- [ ] [Ensure GitHub-compatible markdown settings are documented](../tasks/ensure_github_compatible_markdown_settings_are_doc_md.md) #rejected
- [ ] [Ensure Mongo indexes: `{ _key: 1 } unique` + common query fields](../tasks/ensure_mongo_indexes_key_1_unique_common_query_fie_md.md) #rejected
- [ ] [Expose **Snapshot API** for `processes` (collection `processes`)](../tasks/expose_snapshot_api_for_processes_collection_proce_md.md) #rejected
- [ ] [Expose `/metrics` on an express app and scrape with Prom](../tasks/expose_metrics_on_an_express_app_and_scrape_with_p_md.md) #rejected
- [ ] [Finalize STT workflow](../tasks/finalize_stt_workflow_md_md.md) #rejected
- [ ] [Identify ancestral resonance patterns #framework-core](../tasks/identify_ancestral_resonance_patterns_framework_co_md.md) #rejected
- [ ] [Implement `PAUSE/RESUME` ops on gateway](../tasks/implement_pause_resume_ops_on_gateway_md.md) #rejected
- [ ] [Implement `timetravel.processAt(processId, T)` in a small CLI for debugging](../tasks/implement_timetravel_processat_processid_t_in_a_sm_md.md) #rejected
- [ ] [Implement transcendence cascade #framework-core](../tasks/implement_transcendence_cascade_framework_core_md.md) #rejected
- [ ] [Launch `ReplayAPI` on `:8083`; test `/replay` and `/export?ndjson=1`](../tasks/launch_replayapi_on_8083_test_replay_and_export_nd_md.md) #rejected
- [ ] [Register **v+1** schema for any evolving topic and write minimal **upcaster**](../tasks/register_v_1_schema_for_any_evolving_topic_and_wri_md.md) #rejected
- [ ] [Spin up WS gateway (`WS_PORT=8090 WS_TOKEN=devtoken node index.js`)](../tasks/spin_up_ws_gateway_ws_port_8090_ws_token_devtoken_md.md) #rejected
- [ ] [Suggest metaprogramming updates #codex-task](../tasks/suggest_metaprogramming_updates_codex_task_md.md) #rejected
- [ ] [Summarize clarified priorities for next sprint](../tasks/summarize_clarified_priorities_for_next_sprint_md_md.md) #rejected
- [ ] [Switch critical readers to **subscribeNormalized**](../tasks/switch_critical_readers_to_subscribenormalized_md.md) #rejected
- [ ] [Switch gateway auth to JWT; generate temp HS256 token for dev](../tasks/switch_gateway_auth_to_jwt_generate_temp_hs256_tok_md.md) #rejected
- [ ] [Use **subscribePartitioned** for CPU-heavy consumers; tune `partitions` (power of 2 is fine)](../tasks/use_subscribepartitioned_for_cpu_heavy_consumers_t_md.md) #rejected
- [ ] [Wire `runOutboxDrainer` in event-hub](../tasks/wire_runoutboxdrainer_in_event_hub_md.md) #rejected
- [ ] [Wrap `event-hub` publish path with **withSchemaValidation**; fail fast on bad payloads](../tasks/wrap_event_hub_publish_path_with_withschemavalidat_md.md) #rejected
- [ ] [Wrap writers with **withDualWrite**](../tasks/wrap_writers_with_withdualwrite_md.md) #rejected
- [ ] [Write a replay job that replays `process.state.snapshot` to warm the `processes` collection](../tasks/write_a_replay_job_that_replays_process_state_snap_md.md) #rejected
- [ ] [Write a smoke test: client subscribes, publish 10 msgs, assert all ACKed](../tasks/write_a_smoke_test_client_subscribes_publish_10_ms_md.md) #rejected
- [ ] [move all testing to individual services md](../tasks/move_all_testing_to_individual_services_md.md) #rejected

## Ice Box

- [ ] [Add semantic overlays for layer1 through layer8](../tasks/add_semantic_overlays_for_layer1_through_layer8_md_md.md) #ice-box
- [ ] [Annotate legacy code with migration tags](../tasks/annotate_legacy_code_with_migration_tags_md.md) #ice-box
- [ ] [Define permission schema in AGENTS.md](../tasks/define_permission_schema_in_agents_1_md.md) #ice-box
- [ ] [Design Ollama model file for use with codex CLI](../tasks/design_ollama_model_file_for_use_with_codex_cli.md) #ice-box
- [ ] [Detect contradictions in memory](../tasks/detect_contradictions_in_memory_md_md.md) #ice-box
- [ ] [Document-Driven Development for Service Scripts](../tasks/structure_vault_to_mirror_services_agents_docs_md_md.md) #ice-box
- [ ] [Enable compactor for `process.state` → `process.state.snapshot`](../tasks/enable_compactor_for_process_state_process_state_s_md.md) #ice-box
- [ ] [Evaluate and reward flow satisfaction](../tasks/evaluate_and_reward_flow_satisfaction.md) #ice-box
- [ ] [Gather baseline emotion metrics for Eidolon field](../tasks/gather_baseline_emotion_metrics_for_eidolon_field_1_md.md) #ice-box
- [ ] [Gather open questions about system direction](../tasks/gather_open_questions_about_system_direction_md_md.md) #ice-box
- [ ] [Identify ancestral resonance patterns](../tasks/identify_ancestral_resonance_patterns_md_md.md) #ice-box
- [ ] [Implement fragment ingestion with activation vectors](../tasks/implement_fragment_ingestion_with_activation_vecto_md.md) #ice-box
- [ ] [Implement transcendence cascade](../tasks/implement_transcendence_cascade_md.md) #ice-box
- [ ] [Integrate synthesis-agent pass on `unique/` to produce draft docs](../tasks/integrate_synthesis-agent_pass_on_unique_to_produce_draft_docs_1_md.md) #ice-box
- [ ] [Run `bench/subscribe.ts` with Mongo bus and record p50/p99](../tasks/run_bench_subscribe_ts_with_mongo_bus_and_record_p_md.md) #ice-box
- [ ] [Run model bakeoff](../tasks/run_model_bakeoff_md.md) #ice-box
- [ ] [Schedule alignment meeting with stakeholders](../tasks/schedule_alignment_meeting_with_stakeholders_md_md.md) #ice-box
- [ ] [Snapshot prompts specs to repo](../tasks/snapshot_prompts_specs_to_repo.md) #ice-box
- [ ] [Suggest metaprogramming updates](../tasks/suggest_metaprogramming_updates_md.md) #ice-box
- [ ] [Wire MongoEventStore + MongoCursorStore in place of InMemory](../tasks/wire_mongoeventstore_mongocursorstore_in_place_of_md.md) #ice-box
- [ ] [Write a small **cutover** script to replay historical events through upcasters into snapshots](../tasks/write_a_small_cutover_script_to_replay_historical_md.md) #ice-box
- [ ] [add file system to context management system md md](../tasks/add_file_system_to_context_management_system_md_md.md) #ice-box
- [ ] [allow configuration of hyperparameters through discord context size spectrogram resolution interuption threshold md](../tasks/allow_configuration_of_hyperparameters_through_discord_context_size_spectrogram_resolution_interuption_threshold_md.md) #ice-box
- [ ] [allow old unnessisary messages to decay from database while retaining index entries ids md md](../tasks/allow_old_unnessisary_messages_to_decay_from_database_while_retaining_index_entries_ids_md_md.md) #ice-box
- [ ] [cache decay mechanisim md md](../tasks/cache_decay_mechanisim_md_md.md) #ice-box
- [ ] [define codex cli baseg agent md md](../tasks/define_codex_cli_baseg_agent_md_md.md) #ice-box
- [ ] [design circular buffers for inputs with layered states of persistance in memory on disk cold storage so md](../tasks/design_circular_buffers_for_inputs_with_layered_states_of_persistance_in_memory_on_disk_cold_storage_so_md.md) #ice-box
- [ ] [discord chat link traversal md md](../tasks/discord_chat_link_traversal_md_md.md) #ice-box
- [ ] [obsidian replacement md](../tasks/obsidian_replacement_md.md) #ice-box
- [ ] [reach 100 percent complete test coverage 1 md md](../tasks/reach_100_percent_complete_test_coverage_1_md_md.md) #ice-box
- [ ] [setup a second agent md](../tasks/setup_a_second_agent_md.md) #ice-box
- [ ] [thinking model integration md md](../tasks/thinking_model_integration_md_md.md) #ice-box
- [ ] [tool chain management system md md](../tasks/tool_chain_management_system_md_md.md) #ice-box
- [ ] [twitch discord general auto mod md md](../tasks/twitch_discord_general_auto_mod_md_md.md) #ice-box

## Incoming

- [ ] [Mock broker](../tasks/Mock%20broker.md) #incoming
- [ ] [auth ci and load tests](../tasks/auth_ci_and_load_tests.md) #incoming
- [ ] [auth key rotation and bootstrap](../tasks/auth_key_rotation_and_bootstrap.md) #incoming
- [ ] [auth migrate services to jwt](../tasks/auth_migrate_services_to_jwt.md) #incoming
- [ ] [auth service rfc and architecture](../tasks/auth_service_rfc_and_architecture.md) #incoming
- [ ] [auth service scaffold and endpoints](../tasks/auth_service_scaffold_and_endpoints.md) #incoming
- [ ] [auth shared clients and middleware](../tasks/auth_shared_clients_and_middleware.md) #incoming
- [ ] [cephalon backfill conversation history](../tasks/cephalon_backfill_conversation_history.md) #incoming
- [ ] [cephalon context window from collections](../tasks/cephalon_context_window_from_collections.md) #incoming
- [ ] [cephalon event schema updates](../tasks/cephalon_event_schema_updates.md) #incoming
- [ ] [cephalon feature flag path selection](../tasks/cephalon_feature_flag_path_selection.md) #incoming
- [ ] [cephalon persist llm replies to agent messages](../tasks/cephalon_persist_llm_replies_to_agent_messages.md) #incoming
- [ ] [cephalon persist utterance timing metadata](../tasks/cephalon_persist_utterance_timing_metadata.md) #incoming
- [ ] [cephalon store user transcripts unified](../tasks/cephalon_store_user_transcripts_unified.md) #incoming
- [ ] [cephalon tests for persistence and ecs](../tasks/cephalon_tests_for_persistence_and_ecs.md) #incoming
- [ ] [ecs component schemas core](../tasks/ecs_component_schemas_core.md) #incoming
- [ ] [ecs migration path docs](../tasks/ecs_migration_path_docs.md) #incoming
- [ ] [ecs mongo adapter library](../tasks/ecs_mongo_adapter_library.md) #incoming
- [ ] [ecs persistence integration cephalon](../tasks/ecs_persistence_integration_cephalon.md) #incoming
- [ ] [ecs projection jobs](../tasks/ecs_projection_jobs.md) #incoming
- [ ] [ecs query api gateway](../tasks/ecs_query_api_gateway.md) #incoming
- [ ] [scripts add folder readmes and usage](../tasks/scripts_add_folder_readmes_and_usage.md) #incoming
- [ ] [scripts add make targets and aliases](../tasks/scripts_add_make_targets_and_aliases.md) #incoming
- [ ] [scripts audit and standardize cli flags](../tasks/scripts_audit_and_standardize_cli_flags.md) #incoming
- [ ] [scripts group audio tools](../tasks/scripts_group_audio_tools.md) #incoming
- [ ] [scripts group docs utilities](../tasks/scripts_group_docs_utilities.md) #incoming
- [ ] [scripts group indexing tools](../tasks/scripts_group_indexing_tools.md) #incoming
- [ ] [scripts group kanban remaining](../tasks/scripts_group_kanban_remaining.md) #incoming
- [ ] [scripts update ci and refs](../tasks/scripts_update_ci_and_refs.md) #incoming

## Accepted

- [ ] [Add **withDLQ** around risky consumers; set `maxAttempts`](../tasks/add_withdlq_around_risky_consumers_set_maxattempts_md.md) #accepted
- [ ] [Extract docs from riatzukiza.github.io](../tasks/extract_docs_from_riatzukiza_github_io_md_md.md) #accepted
- [ ] [Extract site modules from riatzukiza.github.io](../tasks/extract_site_modules_from_riatzukiza_github_io_md_md.md) #accepted
- [ ] [File explorer](../tasks/File%20explorer.md) #accepted
- [ ] [Migrate portfolio client code to Promethean](../tasks/migrate_portfolio_client_code_to_promethean_md.md) #accepted
- [ ] [Migrating relevant modules from `riatzukiza.github.io` to `/sites/` and `/docs/`](../tasks/migrating_relevant_modules_from_riatzukiza_github_md.md) #accepted
- [ ] [Promethean Health Dashboard](../tasks/Promethean%20Health%20Dashboard.md) #accepted
- [ ] [Set up proper openai custom gpt compatable oauth login flow](../tasks/Set%20up%20proper%20openai%20custom%20gpt%20compatable%20oauth%20login%20flow.md) #accepted
- [ ] [clean up notes into design docs md](../tasks/clean_up_notes_into_design_docs_md.md) #accepted
- [ ] [discord link indexer md](../tasks/discord_link_indexer_md.md) #accepted
- [ ] [finish whisper npu system md md](../tasks/finish_whisper_npu_system_md_md.md) #accepted
- [ ] [gpt bridge fuzzy lookup should return multiple matches when it is used.](../tasks/gpt%20bridge%20fuzzy%20lookup%20should%20return%20multiple%20matches%20when%20it%20is%20used..md) #accepted
- [ ] [move discord scraper to ts](../tasks/move%20discord%20scraper%20to%20ts.md) #accepted
- [ ] [setup code in wsl md](../tasks/setup_code_in_wsl_md.md) #accepted
- [ ] [setup new service generator](../tasks/setup%20new%20service%20generator.md) #accepted
- [ ] [twitch stream title generator md md](../tasks/twitch_stream_title_generator_md_md.md) #accepted
- [ ] [write end to end tests md md](../tasks/write_end_to_end_tests_md_md.md) #accepted

## Breakdown

- [ ] [LLM service must accept tool calls](../tasks/LLM%20service%20must%20accept%20tool%20calls.md) #breakdown
- [ ] [Phase out proxy in favor of bridge service](../tasks/Phase%20out%20proxy%20in%20favor%20of%20bridge%20service.md) #breakdown
- [ ] [audio processing service](../tasks/audio%20processing%20service.md) #breakdown
- [ ] [clearly standardize data models](../tasks/clearly%20standardize%20data%20models.md) #breakdown
- [ ] [convert current services to packages, then redefine the services using config files](../tasks/convert%20current%20services%20to%20packages%2C%20then%20redefine%20the%20services%20using%20config%20files.md) #breakdown
- [ ] [create a generic markdown helper module](../tasks/create%20a%20generic%20markdown%20helper%20module.md) #breakdown
- [ ] [describe github branching workflow md](../tasks/describe_github_branching_workflow_md.md) #breakdown
- [ ] [dockerize the system](../tasks/dockerize%20the%20system.md) #breakdown
- [ ] [flatten services](../tasks/flatten%20services.md) #breakdown
- [ ] [frontend build tool chain](../tasks/frontend%20build%20tool%20chain.md) #breakdown
- [ ] [lisp package files](../tasks/lisp%20package%20files.md) #breakdown
- [ ] [redefine all existing lambdas with high order functions incoming](../tasks/redefine%20all%20existing%20lambdas%20with%20high%20order%20functions%20incoming.md) #breakdown
- [ ] [refactor speech interuption system to be more inteligent using audio data to decide if interupted md md](../tasks/refactor_speech_interuption_system_to_be_more_inteligent_using_audio_data_to_decide_if_interupted_md_md.md) #breakdown
- [ ] [task generator system](../tasks/task%20generator%20system.md) #breakdown

## Ready

- [ ] [Add Ollama formally to pipeline](../tasks/decouple_from_ollama_md.md) #ready
- [ ] [Migrate server side sibilant libs to promethean architecture](../tasks/migrate_server_side_sibilant_libs_to_promethean_architecture_md.md) #ready
- [ ] [Migrating relevant modules from riatzukiza.github.io to -site- and -docs-](../tasks/migrating_relevant_modules_from_riatzukiza_github_io_to_-site-_and_-docs-_md.md) #ready

## Todo

- [ ] [Add codex layer to emacs](../tasks/Add%20codex%20layer%20to%20emacs.md) #todo
- [ ] [Add git commands to gpt bridge](../tasks/Add%20git%20commands%20to%20gpt%20bridge.md) #todo
- [ ] [Add tool calls to codex context](../tasks/Add%20tool%20calls%20to%20codex%20context.md) #todo
- [ ] [Agent Tasks Persistence Migration to DualStore](../tasks/Agent%20Tasks%20Persistence%20Migration%20to%20DualStore.md) #todo
- [ ] [ChatGPT export injest with dedupe index and hashes](../tasks/ChatGPT%20export%20injest%20with%20dedupe%20index%20and%20hashes.md) #todo
- [ ] [Create broker services that can handle all the same tasks as the gpt bridge](../tasks/Create%20broker%20services%20that%20can%20handle%20all%20the%20same%20tasks%20as%20the%20gpt%20bridge.md) #todo
- [ ] [Curate code from personal repository](../tasks/Curate%20code%20from%20personal%20repository.md) #todo
- [ ] [Decouple Audio Processing Logic From Discord](../tasks/Decouple%20Audio%20Processing%20Logic%20From%20Discord.md) #todo
- [ ] [Ensure openapi specs are automaticly updated when an endpoint is changed](../tasks/Ensure%20openapi%20specs%20are%20automaticly%20updated%20when%20an%20endpoint%20is%20changed.md) #todo
- [ ] [Find music that triggered copyright mute on twitch for analysis incoming](../tasks/Find%20music%20that%20triggered%20copyright%20mute%20on%20twitch%20for%20analysis%20incoming.md) #todo
- [ ] [Finish work on gptbridge agent integration](../tasks/Finish%20work%20on%20gptbridge%20agent%20integration.md) #todo
- [ ] [Fully convert js ts projects to pnpm incoming](../tasks/Fully%20convert%20js%20ts%20projects%20to%20pnpm%20incoming.md) #todo
- [ ] [LLM service must allow streamed responses](../tasks/LLM%20service%20must%20allow%20streamed%20responses.md) #todo
- [ ] [LSP server for home brew lisp incoming](../tasks/LSP%20server%20for%20home%20brew%20lisp%20incoming.md) #todo
- [ ] [MVP local LLM chat interface with tool calls connected to gpt bridge](../tasks/MVP%20local%20LLM%20chat%20interface%20with%20tool%20calls%20connected%20to%20gpt%20bridge.md) #todo
- [ ] [Make the system hashtag aware](../tasks/Make%20the%20system%20hashtag%20aware.md) #todo
- [ ] [OpenAI compatable api](../tasks/OpenAI%20compatable%20api.md) #todo
- [ ] [Replace all python properly with hy incoming](../tasks/Replace%20all%20python%20properly%20with%20hy%20incoming.md) #todo
- [ ] [Set up new user roles and policies for the systems](../tasks/Set%20up%20new%20user%20roles%20and%20policies%20for%20the%20systems.md) #todo
- [ ] [Webcrawler](../tasks/Webcrawler.md) #todo
- [ ] [[[Finalize `MIGRATION_PLAN.md`]]](../tasks/finalize_migration_plan_md_md_md.md) #todo
- [ ] [add twitch chat integration md md](../tasks/add_twitch_chat_integration_md_md.md) #todo
- [ ] [breakdown Makefile.hy](../tasks/breakdown%20Makefile.hy.md) #todo
- [ ] [broker gpt bridge parity plan](../tasks/broker%20gpt%20bridge%20parity%20plan.md) #todo
- [ ] [connect bluesky](../tasks/connect%20bluesky.md) #todo
- [ ] [connect reddit](../tasks/connect%20reddit.md) #todo
- [ ] [connect wikipedia](../tasks/connect%20wikipedia.md) #todo
- [ ] [context service](../tasks/context%20service.md) #todo
- [ ] [convert smartgpt bridge to ts](../tasks/convert%20smartgpt%20bridge%20to%20ts.md) #todo
- [ ] [database migration system](../tasks/database%20migration%20system.md) #todo
- [ ] [discord image awareness md md](../tasks/discord_image_awareness_md_md.md) #todo
- [ ] [flatten sibilant src folders](../tasks/flatten%20sibilant%20src%20folders.md) #todo
- [ ] [full agent mode text chat selectively join channels etc md](../tasks/full_agent_mode_text_chat_selectively_join_channels_etc_md.md) #todo
- [ ] [harden precommit hooks](../tasks/harden%20precommit%20hooks.md) #todo
- [ ] [hy - js interop](../tasks/hy%20-%20js%20interop.md) #todo
- [ ] [implement classes in compiler lisp incoming](../tasks/implement%20classes%20in%20compiler%20lisp%20incoming.md) #todo
- [ ] [implement defun in compiler lisp incoming](../tasks/implement%20defun%20in%20compiler%20lisp%20incoming.md) #todo
- [ ] [kanban-processor](../tasks/kanban-processor.md) #todo
- [ ] [lisp ecosystem files](../tasks/lisp%20ecosystem%20files.md) #todo
- [ ] [periodicly the embedding service will get disconnected from the broker and not die, blocking other processes who require embeddings. incoming](../tasks/periodicly%20the%20embedding%20service%20will%20get%20disconnected%20from%20the%20broker%20and%20not%20die%2C%20blocking%20other%20processes%20who%20require%20embeddings.%20incoming.md) #todo
- [ ] [pin versions in configs md](../tasks/pin_versions_in_configs_md.md) #todo
- [ ] [refactor any python modules not currently for ml stuff discord etc 2 md](../tasks/refactor_any_python_modules_not_currently_for_ml_stuff_discord_etc_2_md.md) #todo
- [ ] [script for getting github action workflow states for a branch](../tasks/script%20for%20getting%20github%20action%20workflow%20states%20for%20a%20branch.md) #todo
- [ ] [set up data migration pipeline and clearly describe conventions](../tasks/set%20up%20data%20migration%20pipeline%20and%20clearly%20describe%20conventions.md) #todo
- [ ] [smart task templater md](../tasks/smart_task_templater_md.md) #todo
- [ ] [tamper monkey script for using templates defined in the vault](../tasks/tamper%20monkey%20script%20for%20using%20templates%20defined%20in%20the%20vault.md) #todo

## In Progress

- [ ] [breakdown cephalon voice commands file using ecs](../tasks/breakdown%20cephalon%20voice%20commands%20file%20using%20ecs.md) #in-progress
- [ ] [seperate discord commands from the actions they perform](../tasks/seperate%20discord%20commands%20from%20the%20actions%20they%20perform.md) #in-progress

## In Review

- [ ] [Update cephalon to use custom embedding function](../tasks/update_cephalon_to_use_custom_embedding_function_md_md.md) #in-review
- [ ] [identify and resolve a service client apparently connecting repeatedly to broker with new session ids](../tasks/identify_and_resolve_a_service_client_apparently_connecting_repeatedly_to_broker_with_new_session_ids.md) #in-review
- [ ] [setup services to recieve work from the broker via push md](../tasks/setup_services_to_recieve_work_from_the_broker_via_push_md.md) #in-review

## Done

- [ ] [Add .obsidian to .gitignore](../tasks/add_obsidian_to_gitignore_md_md.md) #done
- [ ] [Add STT service tests](../tasks/add_stt_service_tests_md.md) #done
- [ ] [Add starter notes - eidolon_fields, cephalon_inner_monologue](../tasks/add_starter_notes_-_eidolon_fields_cephalon_inner_monologue_1_md.md) #done
- [ ] [Add unit tests for date_tools.py](../tasks/add_unit_tests_for_date_tools_py_md.md) #done
- [ ] [Add unit tests for wav_processing](../tasks/add_unit_tests_for_wav_processing_md.md) #done
- [ ] [Auto-generate AGENTS.md stubs from services structure](../tasks/auto-generate_agents_md_stubs_from_services_structure_md_md.md) #done
- [ ] [Build data structures for Eidolon field](../tasks/build_data_structures_for_eidolon_field_md_md.md) #done
- [ ] [Build data structures for Eidolon field #codex-task](../tasks/build_data_structures_for_eidolon_field_codex_task_md.md) #done
- [ ] [Clarify Promethean project vision](../tasks/clarify_promethean_project_vision_1_md.md) #done
- [ ] [Create permission gating layer](../tasks/create_permission_gating_layer.md) #done
- [ ] [Create vault-config .obsidian with Kanban and minimal vault setup](../tasks/create_vault-config_obsidian_with_kanban_and_minimal_vault_setup_1_md_md.md) #done
- [ ] [Determine PM2 configuration for agents](../tasks/determine_pm2_configuration_for_agents_1_md.md) #done
- [ ] [Document board usage guidelines](../tasks/document_board_usage_guidelines_1_md.md) #done
- [ ] [Document local testing setup](../tasks/document_local_testing_setup_md_md.md) #done
- [ ] [Fix Makefile test target](../tasks/fix_makefile_test_target_md.md) #done
- [ ] [Mirror shared utils with language-specific doc folders](../tasks/mirror_shared_utils_with_language-specific_doc_folders_md_md.md) #done
- [ ] [Research GitHub Projects board API](../tasks/research_github_projects_board_api_md.md) #done
- [ ] [Start Eidolon](../tasks/start_eidolon.md) #done
- [ ] [Write board sync script](../tasks/write_board_sync_script_md_md.md) #done
- [ ] [Write meaningful tests for Cephalon](../tasks/write_meaningful_tests_for_cephalon_md_md.md) #done
- [ ] [Write vault-config README.md for Obsidian vault onboarding](../tasks/write_vault_config_readme_md_for_obsidian_vault_on_md.md) #done
- [ ] [clearly seperate service dependency files md](../tasks/clearly_seperate_service_dependency_files_md.md) #done
- [ ] [discord image attachment indexer md](../tasks/discord_image_attachment_indexer_md.md) #done
- [ ] [make seperate execution pathways 1 md md](../tasks/make_seperate_execution_pathways_1_md_md.md) #done
- [ ] [seperate all testing pipelines in GitHub Actions](../tasks/separate_all_testing_pipelines_in_github_actions_md.md) #done
- [ ] [update GitHub Actions to use Makefile](../tasks/update_github_actions_to_use_makefile_md_md.md) #done
- [ ] [write simple ecosystem declaration library for new agents](../tasks/write_simple_ecosystem_declaration_library_for_new_md_md.md) #done

## Archive

- [ ] [Add unit tests for GUI helpers](../tasks/add_unit_tests_for_gui_helpers_md_md.md) #archive
- [ ] [Build tiny web page that uses `PromClient` in the browser to show live `process.state` (optional)](../tasks/build_tiny_web_page_that_uses_promclient_in_the_br_md.md) #archive
- [ ] [Document board sync workflow](../tasks/document_board_sync_workflow_md_md.md) #archive
- [ ] [Obsidian Kanban Github Project Board Mirror system](../tasks/obsidian_kanban_github_project_board_mirror_system_md_md.md) #archive
- [ ] [Pin versions in configs (Promethean + Codex)](../tasks/pin_versions_in_configs_promethean_codex_md.md) #archive
- [ ] [Run bakeoff (see below)](../tasks/run_bakeoff_see_below_md.md) #archive
- [ ] [Set up Makefile for Python + JS build test dev](../tasks/set_up_makefile_for_python_js_build_test_dev_md.md) #archive
- [ ] [Update Makefile to have commands specific for agents](../tasks/update_makefile_to_have_commands_specific_for_agents_md.md) #archive
- [ ] [create base readme md templates for each service md](../tasks/create_base_readme_md_templates_for_each_service_md.md) #archive
- [ ] [each service registers a pid with a heartbeat service if they do not successfully check in terminate the process using the pid md md](../tasks/each_service_registers_a_pid_with_a_heartbeat_service_if_they_do_not_successfully_check_in_terminate_the_process_using_the_pid_md_md.md) #archive
- [ ] [look into why the state object never seems to get updated md md](../tasks/look_into_why_the_state_object_never_seems_to_get_updated_md_md.md) #archive
- [ ] [make discord channel aware contextualizer md md](../tasks/make_discord_channel_aware_contextualizer_md_md.md) #archive
- [ ] [prevent dangling processes when a process fails due to error or automaticly clean them up 1 md md](../tasks/prevent_dangling_processes_when_a_process_fails_due_to_error_or_automaticly_clean_them_up_1_md_md.md) #archive
- [ ] [send waveforms spectrograms and dekstop screenshots to discord for remote storage md md](../tasks/send_waveforms_spectrograms_and_dekstop_screenshots_to_discord_for_remote_storage_md_md.md) #archive

%% kanban:settings
```
{"kanban-plugin":"board","list-collapse":[false,false,true,false,false,false,false,false,false,false,false,false,false,false],"new-note-template":"docs/agile/templates/task.stub.template.md","new-note-folder":"docs/agile/tasks","metadata-keys":[{"metadataKey":"tags","label":"","shouldHideLabel":false,"containsMarkdown":false},{"metadataKey":"hashtags","label":"","shouldHideLabel":false,"containsMarkdown":false}]}
```

%%
