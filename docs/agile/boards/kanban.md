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

## Migration Checklists

- [ ] [[reports/persistence-migration-checklist.md|Persistence Migration Checklist]]

## Ice Box

- [ ] [[evaluate_and_reward_flow_satisfaction_md_md.md|Evaluate and reward flow satisfaction]] #framework-core #ice-box — Provides feedback loops to encourage efficient contributor flow.
- [ ] [[define_codex_cli_baseg_agent_md_md.md|define codex cli baseg agent md md]] #framework-core #ice-box — Establishes a minimal command-line agent skeleton for reuse.
- [ ] [[discord_chat_link_traversal_md_md.md|discord chat link traversal md md]] #framework-core #ice-box — Enables cross-reference of conversation threads for improved context.
- [ ] [[obsidian_replacement_md.md|obsidian replacement md]] #framework-core #ice-box — Explores alternative knowledge base platforms; blocked on selecting a suitable replacement.
- [ ] [[reach_100_percent_complete_test_coverage_1_md_md.md|reach 100 percent complete test coverage 1 md md]] #framework-core #ice-box — Ensures robust system reliability, though scope is currently undefined.
- [ ] [[tool_chain_management_system_md_md.md|tool chain management system md md]] #framework-core #ice-box — Centralizes tooling configuration, but integration design is pending.
- [ ] [[gather_baseline_emotion_metrics_for_eidolon_field_1_md.md|Gather baseline emotion metrics for Eidolon field]] #framework-core #ice-box — Creates reference data for measuring emotional state changes.
- [ ] [[identify_ancestral_resonance_patterns_md_md.md|Identify ancestral resonance patterns]] #framework-core #ice-box — Reveals historical motifs influencing current system behavior.
- [ ] [[integrate_synthesis-agent_pass_on_unique_to_produce_draft_docs_1_md.md|Integrate synthesis-agent pass on `unique/` to produce draft docs]] #framework-core #ice-box — Automates document drafting from raw note dumps.
- [ ] [[add_semantic_overlays_for_layer1_through_layer8_md_md.md|Add semantic overlays for layer1 through layer8]] #layerX #framework-core #ice-box — Adds layer-specific metadata to aid cross-agent reasoning.
- [ ] [[gather_open_questions_about_system_direction_md_md.md|Gather open questions about system direction]] #framework-core #ice-box — Collects unresolved strategic decisions to steer the roadmap.

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

- [ ] [[LLM service must allow streamed responses]]
- [ ] [[Set up new user roles and policies for the systems]]
- [ ] [[tamper monkey script for using templates defined in the vault]]
- [ ] [[Make the system hashtag aware]]
- [ ] [[Add codex layer to emacs]]


## Breakdown (17)

- [ ] [[design_circular_buffers_for_inputs_with_layered_states_of_persistance_in_memory_on_disk_cold_storage_so_md.md|design circular buffers for inputs with layered states of persistance in memory on disk cold storage so md]] #framework-core #breakdown — Improves memory efficiency by aging data across storage tiers.
- [ ] [[thinking_model_integration_md_md.md|thinking model integration md md]] #framework-core #breakdown — Unifies cognitive flows with decision processes but needs clearer specification.
- [ ] [[Find music that triggered copyright mute on twitch for analysis incoming]] #breakdown — Prevents future stream interruptions by identifying the offending track.
- [ ] [[finish_whisper_npu_system_md_md.md|finish whisper npu system md md]] #framework-core #performance-optimization #npu-integration #breakdown — Completes NPU integration to speed Whisper inference.
- [ ] [[implement_fragment_ingestion_with_activation_vecto_md.md|Implement fragment ingestion with activation vectors]] #framework-core #codex-task #breakdown — Enables semantic linking of fragments via vector activations.
- [ ] [[schedule_alignment_meeting_with_stakeholders_md_md.md|Schedule alignment meeting with stakeholders]] #framework-core #breakdown — Aligns team priorities to accelerate decision-making.
- [ ] [[write_a_small_cutover_script_to_replay_historical_md.md|Write a small **cutover** script to replay historical events through upcasters into snapshots]] #breakdown — Facilitates data migration by reprocessing events into new snapshot format.
- [ ] [[snapshot_prompts_specs_to_repo_md_md.md|Snapshot prompts and specs to repo]] #breakdown — Preserves prompt and specification history for auditing.
- [ ] [[wire_mongoeventstore_mongocursorstore_in_place_of_md.md|Wire MongoEventStore + MongoCursorStore in place of InMemory]] #breakdown — Introduces persistent event sourcing to support scaling.
- [ ] [[annotate_legacy_code_with_migration_tags_md.md|Annotate legacy code with migration tags]] #framework-core #breakdown — Highlights outdated components to guide refactors.
- [ ] [[allow_configuration_of_hyperparameters_through_discord_context_size_spectrogram_resolution_interuption_threshold_md.md|Allow configuration of hyperparameters through discord (context size, spectrogram resolution, interuption threshold]] #framework-core #breakdown — Empowers real-time tuning of model parameters via chat.
- [ ] [[define_permission_schema_in_agents_1_md.md|Define permission schema in AGENTS.md]] #framework-core #eidolon #Dorian #layer2 #breakdown — Clarifies capability boundaries to enforce security policies.
- [ ] [[connect reddit]]
- [ ] [[connect bluesky]]
- [ ] [[connect wikipedia]]
- [ ] [[lisp ecosystem files]]
- [ ] [[hy - js interop]]
- [ ] [[frontend build tool chain]] (13 pts) — Oversized; refine build pipeline
- [ ] [[flatten services]] (8 pts) — Oversized; restructure modules
- [ ] [[lisp package files]] (8 pts) — Oversized; define packaging strategy
- [ ] [[clearly standardize data models]] (8 pts) — Oversized; ensure cross-service consistency
- [ ] [[dockerize the system]] (8 pts) — Oversized; plan containerization
- [ ] [[LSP server for home brew lisp incoming]]
- [ ] [[Mock broker]] #incoming
- [ ] [[Replace all python properly with hy incoming]]
- [ ] [[breakdown Makefile.hy]]
- [ ] [[move discord scraper to ts]]
- [ ] [[gpt bridge fuzzy lookup should return multiple matches when it is used.]]
- [ ] [[broker gpt bridge parity plan]]
- [ ] [[Set up proper openai custom gpt compatable oauth login flow]]
- [ ] [[Agent Tasks Persistence Migration to DualStore]]
- [ ] [[Create broker services that can handle all the same tasks as the gpt bridge]]

## Ready

- [ ] [[audio processing service]] (8 pts)
- [ ] [[Phase out proxy in favor of bridge service]] (5 pts)
- [ ] [[convert current services to packages, then redefine the services using config files]] (5 pts)
- [ ] [[task generator system]] (3 pts)
- [ ] [[create a generic markdown helper module]] (2 pts)
- [ ] [[redefine all existing lambdas with high order functions incoming]] (1 pt)

## Todo (21)
- [ ] [[Phase out proxy in favor of bridge service]]

- [ ] [[LLM service must accept tool calls]] (5 pts) — High priority: enables tool-driven workflows
- [ ] [[update_makefile_to_have_commands_specific_for_agents_md.md|Update Makefile to have commands specific for agents]] (3 pts) — Medium priority: improves agent development
- [ ] [[LLM service must accept tool calls]] #feature (1)
- [ ] [[flatten services]] #refactor (2)
- [ ] [[update_makefile_to_have_commands_specific_for_agents_md.md|Update Makefile to have commands specific for agents]] #infrastructure (3)
- [ ] [[frontend build tool chain]] #infrastructure (4)
- [ ] [[clearly standardize data models]] #refactor (5)
- [ ] [[dockerize the system]] #infrastructure (6)
- [ ] [[lisp package files]] #feature (7)


## In Progress (7)

- [ ] [[ChatGPT export injest with dedupe index and hashes]]
- [ ] [[finish_whisper_npu_system_md_md.md|finish whisper NPU system.md]] #framework-core #performance-optimization #npu-integration #accepted
- [ ] [[database migration system]]
- [ ] [[full_agent_mode_text_chat_selectively_join_channels_etc_md.md|Full agent mode (Text chat, selectively join channels, etc]] #framework-core #accepted
- [ ] [[add_twitch_chat_integration_md_md.md|Add twitch chat integration.md]] #framework-core #accepted
- [ ] [[script for getting github action workflow states for a branch]]
- [ ] [[harden precommit hooks]]


## In Review (0)


## Done

- [ ] [[Curate code from personal repository]]
- [ ] [[Add tool calls to codex context]]
- [ ] [[migrate_portfolio_client_code_to_promethean_md.md|Migrate portfolio client code to Promethean]] #framework-core #accepted
- [ ] [[Finish work on gptbridge agent integration]]
- [ ] [[clarify_promethean_project_vision_1_md.md|Clarify Promethean project vision]] #framework-core #accepted
- [ ] finish moving the smartgpt bridge to fastify
- [ ] [[Fully convert js ts projects to pnpm incoming]]
- [ ] [[Ensure openapi specs are automaticly updated when an endpoint is changed]]
- [ ] [[create_base_readme_md_templates_for_each_service_md.md|create base readme md templates for each service]] #doc-this #framework-core #ritual #in-review
- [ ] [[identify_and_resolve_a_service_client_apparently_connecting_repeatedly_to_broker_with_new_session_ids.md|identify and resolve a service client apparently connecting repeatedly to broker with new session ids]] #in-review
- [ ] [[OpenAI compatable api]]
- [ ] [[update_cephalon_to_use_custom_embedding_function_md_md.md|Update cephalon to use custom embedding function]] #framework-core #cephalon #discord #embedding #typescript #in-review
- [ ] [[discord_image_attachment_indexer_md.md|discord image attachment indexer md]] #framework-core #discord #images #attachments #indexing #memory #done
- [ ] [[clearly_seperate_service_dependency_files_md.md|clearly seperate service dependency files md]] #devops #cicd #done
- [ ] [[add_obsidian_to_gitignore_md_md.md|Add .obsidian to .gitignore]] #framework-core #done
- [ ] [[add_stt_service_tests_md.md|Add STT service tests]] #codex-task #testing #done
- [ ] [[add_starter_notes_-_eidolon_fields_cephalon_inner_monologue_1_md.md|Add starter notes - eidolon_fields, cephalon_inner_monologue]] #framework-core #done
- [ ] [[add_unit_tests_for_date_tools_py_md.md|Add unit tests for date_tools.py]] #codex-task #testing #done
- [ ] [[add_unit_tests_for_wav_processing_md.md|Add unit tests for wav_processing]] #codex-task #testing #done
- [ ] [[auto-generate_agents_md_stubs_from_services_structure_md_md.md|Auto-generate AGENTS.md stubs from services structure]] #framework-core #done
- [ ] [[build_data_structures_for_eidolon_field_md_md.md|Build data structures for Eidolon field]] #framework-core #done
- [ ] [[build_data_structures_for_eidolon_field_codex_task_md.md|Build data structures for Eidolon field #codex-task]] #codex-task #done
- [ ] [[create_permission_gating_layer_1_md_md.md|Create permission gating layer]] #framework-core #done
- [ ] [[create_permission_gating_layer_framework_core_md.md|Create permission gating layer #framework-core]] #framework-core #done
- [ ] [[create_vault-config_obsidian_with_kanban_and_minimal_vault_setup_1_md_md.md|Create vault-config .obsidian with Kanban and minimal vault setup]] #framework-core #done
- [ ] [[determine_pm2_configuration_for_agents_1_md.md|Determine PM2 configuration for agents]] #framework-core #done
- [ ] [[document_board_usage_guidelines_1_md.md|Document board usage guidelines]] #framework-core #done
- [ ] [[document_local_testing_setup_md_md.md|Document local testing setup]] #codex-task #testing #done
- [ ] [[fix_makefile_test_target_md.md|Fix Makefile test target]] #codex-task #testing #done
- [ ] [[mirror_shared_utils_with_language-specific_doc_folders_md_md.md|Mirror shared utils with language-specific doc folders]] #framework-core #done
- [ ] [[research_github_projects_board_api_md.md|Research GitHub Projects board API]] #framework-core #done
- [ ] [[write_board_sync_script_md_md.md|Write board sync script]] #framework-core #done
- [ ] [[write_meaningful_tests_for_cephalon_md_md.md|Write meaningful tests for Cephalon]] #codex-task #testing #done
- [ ] [[write_vault_config_readme_md_for_obsidian_vault_on_md.md|Write vault-config README.md for Obsidian vault onboarding]] #framework-core #done
- [ ] [[create_permission_gating_layer_1_md.md|create permission gating layer 1 md]] #done
- [ ] [[make_seperate_execution_pathways_1_md_md.md|make seperate execution pathways 1 md md]] #framework-core #done
- [ ] [[separate_all_testing_pipelines_in_github_actions_md.md|seperate all testing pipelines in GitHub Actions]] #cicd #framework-core #done
- [ ] [[start_eidolon_md.md|start eidolon md]] #done
- [ ] [[update_github_actions_to_use_makefile_md_md.md|update GitHub Actions to use Makefile]] #cicd #devops #framework-core #done
- [ ] [[write_simple_ecosystem_declaration_library_for_new_md_md.md|write simple ecosystem declaration library for new agents]] #framework-core #done
- [ ] [[write_vault_config_readme_md_for_obsidian_vault_on_md.md|Write \`vault-config/README.md\` for Obsidian vault onboarding]] #framework-core #done
- [ ] [[document_local_testing_setup_md_md.md|Document local testing setup]] #codex-task #testing #done
- [ ] [[add_obsidian_to_gitignore_md_md.md|Add .obsidian to .gitignore]] #framework-core #done
- [ ] [[auto-generate_agents_md_stubs_from_services_structure_md_md.md|Auto-generate AGENTS.md stubs from services structure]] #framework-core #done
- [ ] [[build_data_structures_for_eidolon_field_md_md.md|Build data structures for Eidolon field]] #framework-core #done
- [ ] [[build_data_structures_for_eidolon_field_codex_task_md.md|Build data structures for Eidolon field #codex-task]] #codex-task #done
- [ ] [[set_up_makefile_for_python_js_build_test_dev_md.md|Set up Makefile for Python + JS build test dev]] #cicd #buildtools #devtools #devops #done
- [ ] [[separate_all_testing_pipelines_in_github_actions_md.md|Separate all testing pipelines in GitHub Actions]] #cicd #framework-core #done
- [ ] [[fix_makefile_test_target_md.md|Fix Makefile test target]] #codex-task #testing #done
- [ ] [[create_permission_gating_layer_framework_core_md.md|Create permission gating layer #framework-core]] #framework-core #done
- [ ] [[write_simple_ecosystem_declaration_library_for_new_md_md.md|write simple ecosystem declaration library for new agents]] #framework-core #done
- [ ] [[determine_pm2_configuration_for_agents_1_md.md|Determine PM2 configuration for agents]] #framework-core #done
- [ ] [[mirror_shared_utils_with_language-specific_doc_folders_md_md.md|Mirror shared utils with language-specific doc folders]] #framework-core #done
- [ ] [[write_board_sync_script_md_md.md|Write board sync script]] #framework-core #done
- [ ] [[fix_makefile_test_target_md.md|Fix Makefile test target]] #codex-task #testing #done
- [ ] [[add_unit_tests_for_wav_processing_md.md|Add unit tests for wav_processing]] #codex-task #testing #done
- [ ] [[document_board_usage_guidelines_1_md.md|Document board usage guidelines]] #framework-core #done
- [ ] [[add_stt_service_tests_md.md|Add STT service tests]] #codex-task #testing #done
- [ ] [[create_permission_gating_layer_1_md_md.md|Create permission gating layer]] #framework-core #done
- [ ] [[add_starter_notes_-_eidolon_fields_cephalon_inner_monologue_1_md.md|Add starter notes - eidolon_fields, cephalon_inner_monologue]] #framework-core #done
- [ ] [[add_unit_tests_for_date_tools_py_md.md|Add unit tests for date_tools.py]] #codex-task #testing #done
- [ ] [[write_meaningful_tests_for_cephalon_md_md.md|Write meaningful tests for Cephalon]] #codex-task #testing #done
- [ ] [[create_vault-config_obsidian_with_kanban_and_minimal_vault_setup_1_md_md.md|Create vault-config .obsidian with Kanban and minimal vault setup]] #framework-core #done
- [ ] [[separate_all_testing_pipelines_in_github_actions_md.md|seperate all testing pipelines in GitHub Actions]] #cicd #framework-core #done
- [ ] [[update_github_actions_to_use_makefile_md_md.md|update GitHub Actions to use Makefile]] #cicd #devops #framework-core #done
- [ ] [[make_seperate_execution_pathways_1_md_md.md|Make seperate execution pathways 1.md]] #framework-core #done
- [ ] [[add_unit_tests_for_wav_processing_md.md|Add unit tests for wav\_processing]] #codex-task #testing #done
- [ ] [[add_stt_service_tests_md.md|Add STT service tests]] #codex-task #testing #done
- [ ] [[add_unit_tests_for_date_tools_py_md.md|Add unit tests for date\_tools.py]] #codex-task #testing #done
- [ ] [[add_starter_notes_-_eidolon_fields_cephalon_inner_monologue_1_md.md|Add starter notes - eidolon\_fields, cephalon\_inner\_monologue]] #framework-core #done
- [ ] [[create_permission_gating_layer_1_md_md.md|Create permission gating layer]] #framework-core #done
- [ ] [[document_board_usage_guidelines_1_md.md|Document board usage guidelines]] #framework-core #done
- [ ] [[start_eidolon_md_md.md|Start Eidolon]] #framework-core #done

## Rejected

- [ ] [[enable_compactor_for_process_state_process_state_s_md.md|Enable compactor for `process.state` → `process.state.snapshot`]] #rejected
- [ ] [[run_bench_subscribe_ts_with_mongo_bus_and_record_p_md.md|Run \`bench/subscribe.ts\` with Mongo bus and record p50/p99]] #rejected
- [ ] [[flatten sibilant src folders]]
- [ ] [[write_end_to_end_tests_md_md.md|write end to end tests md md]] #framework-core #accepted
- [ ] [[migrate_server_side_sibilant_libs_to_promethean_ar_md.md|Migrate server side sibilant libs to Promethean architecture.]] #rejected
- [ ] [[add_withdlq_around_risky_consumers_set_maxattempts_md.md|Add **withDLQ** around risky consumers; set `maxAttempts`]] #rejected
- [ ] [[Decouple Audio Processing Logic From Discord|Split out audio processing logic to a seperate service without changing the current behavior in cephalon.md]] #framework-core #ready
- [ ] [[snapshot_prompts_specs_to_repo_md.md|snapshot prompts specs to repo md]] #rejected
- [ ] [[add_startchangelogprojector_for_any_compaction_lik_md.md|Add **startChangelogProjector** for any compaction-like topic you want live-queryable]] #rejected
- [ ] [[add_ollama_formally_to_pipeline_md_md.md|Add Ollama formally to pipeline]] #rejected
- [ ] [[add_prometheus_events_counters_in_ws_server_hook_p_md.md|Add Prometheus `events_*` counters in WS server hook points]] #rejected
- [ ] [[add_ttls_per_topic_via_migration_script_md.md|Add TTLs per topic via migration script]] #rejected
- [ ] [[add_lag_checks_to_ci_smoke_ensure_small_lag_after_md.md|Add `/lag` checks to CI smoke (ensure small lag after publishing bursts)]] #rejected
- [ ] [[add_ops_endpoint_to_list_partition_assignments_opt_md.md|Add `/ops` endpoint to list **partition assignments** (optional: dump coordinator state)]] #rejected
- [ ] [[add_mongodedupe_and_replace_critical_consumers_wit_md.md|Add `MongoDedupe` and replace critical consumers with `subscribeExactlyOnce`]] #rejected
- [ ] [[add_mongooutbox_to_any_service_that_writes_db_chan_md.md|Add `MongoOutbox` to any service that writes DB changes; swap local app emits → outbox writes]] #rejected
- [ ] [[add_tokenbucket_to_ws_server_conn_per_topic_md.md|Add `TokenBucket` to WS server (conn + per-topic)]] #rejected
- [ ] [[add_dev_harness_int_test_ts_to_ci_integration_stag_md.md|Add `dev.harness.int.test.ts` to CI integration stage]] #rejected
- [ ] [[add_manualack_to_event_bus_and_re_run_tests_md.md|Add `manualAck` to event bus and re-run tests]] #rejected
- [ ] [[add_process_txn_projector_to_upsert_processes_host_md.md|Add `process.txn` projector to upsert `processes` + `host_stats` atomically]] #rejected
- [ ] [[add_snapshot_consumer_to_warm_cache_on_boot_md.md|Add snapshot consumer to warm cache on boot]] #rejected
- [ ] [[add_vault_instructions_to_main_readme_md_md_md.md|Add vault instructions to main README.md]] #framework-core #rejected
- [ ] [[define_default_scopes_publish_heartbeat_received_s_md.md|Define default scopes: `publish:heartbeat.received`, `subscribe:process.state`]] #rejected
- [ ] [[deploy_changefeed_for_collections_you_want_mirrore_md.md|Deploy **changefeed** for collections you want mirrored to topics]] #rejected
- [ ] [[detect_contradictions_in_memory_codex_task_md.md|Detect contradictions in memory #codex-task]] #codex-task #rejected
- [ ] [[document_etag_semantics_and_cache_headers_for_snap_md.md|Document ETag semantics and cache headers for `/snap/:key`]] #rejected
- [ ] [[enable_scripts_lint_topics_ts_in_ci_md.md|Enable **scripts/lint-topics.ts** in CI]] #rejected
- [ ] [[ensure_github_compatible_markdown_settings_are_doc_md.md|Ensure GitHub-compatible markdown settings are documented]] #documentation #rejected
- [ ] [[ensure_mongo_indexes_key_1_unique_common_query_fie_md.md|Ensure Mongo indexes: `{ _key: 1 } unique` + common query fields]] #rejected
- [ ] [[evaluate_and_reward_flow_satisfaction_framework_co_md.md|Evaluate and reward flow satisfaction #framework-core]] #framework-core #rejected
- [ ] [[expose_snapshot_api_for_processes_collection_proce_md.md|Expose **Snapshot API** for `processes` (collection `processes`)]] #rejected
- [ ] [[expose_metrics_on_an_express_app_and_scrape_with_p_md.md|Expose `/metrics` on an express app and scrape with Prom]] #rejected
- [ ] [[finalize_stt_workflow_md_md.md|Finalize STT workflow]] #codex-task #testing #rejected
- [ ] [[identify_ancestral_resonance_patterns_framework_co_md.md|Identify ancestral resonance patterns #framework-core]] #framework-core #rejected
- [ ] [[implement_pause_resume_ops_on_gateway_md.md|Implement `PAUSE/RESUME` ops on gateway]] #rejected
- [ ] [[implement_timetravel_processat_processid_t_in_a_sm_md.md|Implement `timetravel.processAt(processId, T)` in a small CLI for debugging]] #rejected
- [ ] [[implement_transcendence_cascade_framework_core_md.md|Implement transcendence cascade #framework-core]] #framework-core #rejected
- [ ] [[launch_replayapi_on_8083_test_replay_and_export_nd_md.md|Launch `ReplayAPI` on `:8083`; test `/replay` and `/export?ndjson=1`]] #rejected
- [ ] [[register_v_1_schema_for_any_evolving_topic_and_wri_md.md|Register **v+1** schema for any evolving topic and write minimal **upcaster**]] #rejected
- [ ] [[spin_up_ws_gateway_ws_port_8090_ws_token_devtoken_md.md|Spin up WS gateway (`WS_PORT=8090 WS_TOKEN=devtoken node index.js`)]] #rejected
- [ ] [[suggest_metaprogramming_updates_codex_task_md.md|Suggest metaprogramming updates #codex-task]] #codex-task #rejected
- [ ] [[summarize_clarified_priorities_for_next_sprint_md_md.md|Summarize clarified priorities for next sprint]] #framework-core #reject #rejected
- [ ] [[switch_critical_readers_to_subscribenormalized_md.md|Switch critical readers to **subscribeNormalized**]] #rejected
- [ ] [[switch_gateway_auth_to_jwt_generate_temp_hs256_tok_md.md|Switch gateway auth to JWT; generate temp HS256 token for dev]] #rejected
- [ ] [[use_subscribepartitioned_for_cpu_heavy_consumers_t_md.md|Use **subscribePartitioned** for CPU-heavy consumers; tune `partitions` (power of 2 is fine)]] #rejected
- [ ] [[wire_runoutboxdrainer_in_event_hub_md.md|Wire `runOutboxDrainer` in event-hub]] #rejected
- [ ] [[wrap_event_hub_publish_path_with_withschemavalidat_md.md|Wrap `event-hub` publish path with **withSchemaValidation**; fail fast on bad payloads]] #rejected
- [ ] [[wrap_writers_with_withdualwrite_md.md|Wrap writers with **withDualWrite**]] #rejected
- [ ] [[write_a_replay_job_that_replays_process_state_snap_md.md|Write a replay job that replays `process.state.snapshot` to warm the `processes` collection]] #rejected
- [ ] [[write_a_smoke_test_client_subscribes_publish_10_ms_md.md|Write a smoke test: client subscribes, publish 10 msgs, assert all ACKed]] #rejected
- [ ] [[move_all_testing_to_individual_services_md.md|move all testing to individual services md]] #Duplicate #rejected
- [ ] [[annotate_legacy_code_with_migration_tags_md.md|Annotate legacy code with migration tags]] #framework-core #rejected
- [ ] [[migrating_relevant_modules_from_riatzukiza_github_md.md|Migrating relevant modules from `riatzukiza.github.io` to `/sites/` and `/docs/`]] #rejected
- [ ] [[create_permission_gating_layer_codex_task_md.md|Create permission gating layer #codex-task]] #codex-task #rejected
- [ ] [[create_permission_gating_layer_framework_core_md.md|Create permission gating layer #framework-core]] #framework-core #rejected
- [ ] [[write_a_small_cutover_script_to_replay_historical_md.md|Write a small \*\*cutover\*\* script to replay historical events through upcasters into snapshots]] #rejected
- [ ] [[write_vault_config_readme_md_for_obsidian_vault_on_md.md|Write vault-config README.md for Obsidian vault onboarding]] #framework-core #rejected
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

---

## Archive

- [ ] [[clean_up_notes_into_design_docs_md.md|clean up notes into design docs md]] #framework-core #agent-thinking #accepted
- [ ] [[migrating_relevant_modules_from_riatzukiza_github_md.md|Migrating relevant modules from `riatzukiza.github.io` to `/sites/` and `/docs/`]] #accepted
- [ ] [[Curate code from personal repository]]
- [ ] [[extract_docs_from_riatzukiza_github_io_md_md.md|Extract docs from riatzukiza.github.io]] #framework-core #accepted

%% kanban:settings

```
{"kanban-plugin":"board","list-collapse":[false,false,true,false,false,false,false,false,false,false,false,false,false,false],"new-note-template":"docs/agile/templates/task.stub.template.md","new-note-folder":"docs/agile/tasks","metadata-keys":[{"metadataKey":"tags","label":"","shouldHideLabel":false,"containsMarkdown":false},{"metadataKey":"hashtags","label":"","shouldHideLabel":false,"containsMarkdown":false}]}
```

%%
