# Frontend Service DSL Documentation

## Overview

The Frontend Service DSL is a comprehensive domain-specific language for configuring and managing frontend services in ClojureScript. It provides declarative, expressive APIs for server configuration, routing, package management, and more.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core DSL Macros](#core-dsl-macros)
3. [Configuration DSL](#configuration-dsl)
4. [Routing DSL](#routing-dsl)
5. [Package Management DSL](#package-management-dsl)
6. [Advanced Features](#advanced-features)
7. [Security DSL](#security-dsl)
8. [Testing DSL](#testing-dsl)
9. [Migration Guide](#migration-guide)
10. [Best Practices](#best-practices)
11. [API Reference](#api-reference)

## Quick Start

### Basic Server Setup

```clojure
(require '[promethean.frontend-service.dsl :as dsl])

;; Define a simple server
(dsl/defserver my-service
  {:port 3000
   :host "localhost"
   :packages-dir "./packages"
   :static-assets true
   :health-endpoint true})

;; Define routes
(dsl/defroutes my-routes
  (dsl/GET "/health" [] health-handler)
  (dsl/GET "/version" [] version-handler)
  (dsl/static-route "/static/*" {:root "./static"}))

;; Start the service
(def app (dsl-core/create-server-with-config @my-service))
```

### Environment-Based Configuration

```clojure
(dsl/defconfig my-config
  {:server (dsl/server-config
             :port (dsl/env-or "PORT" 3000)
             :host (dsl/env-or "HOST" "localhost"))
   :packages (dsl/package-config
               :scan-dirs [(dsl/env-or "PACKAGES_DIR" "./packages")]
               :auto-reload (dsl/env-or "AUTO_RELOAD" false))})
```

## Core DSL Macros

### `defserver`

Defines a frontend service server with declarative configuration.

#### Syntax

```clojure
(defserver name config-map)
```

#### Parameters

- `name`: Symbol - The name of the server definition
- `config-map`: Map - Server configuration options

#### Configuration Options

| Key | Type | Required | Default | Description |
|-----|------|----------|---------|-------------|
| `:port` | integer | yes | - | Server port (1-65535) |
| `:host` | string | yes | - | Server host |
| `:packages-dir` | string | no | "./packages" | Packages directory |
| `:static-assets` | boolean | no | true | Enable static asset serving |
| `:health-endpoint` | boolean | no | true | Enable health endpoint |
| `:cors` | map | no | nil | CORS configuration |

#### CORS Configuration

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `:origin` | string | yes | Allowed origin |
| `:methods` | vector | yes | Allowed HTTP methods |

#### Examples

```clojure
;; Basic server
(dsl/defserver simple-service
  {:port 3000
   :host "localhost"})

;; Server with CORS
(dsl/defserver cors-service
  {:port 3000
   :host "localhost"
   :cors {:origin "*" :methods [:get :post :put :delete]}})

;; Production server
(dsl/defserver production-service
  {:port 80
   :host "0.0.0.0"
   :packages-dir "./packages"
   :static-assets true
   :health-endpoint true
   :cors {:origin "https://app.example.com"
           :methods [:get :post]}})
```

### `defroutes`

Defines routing configuration for the frontend service.

#### Syntax

```clojure
(defroutes name & route-definitions)
```

#### Route Definitions

Routes can be defined using HTTP method macros or the generic `route` macro.

#### HTTP Method Macros

- `GET`
- `POST`
- `PUT`
- `DELETE`
- `PATCH`
- `HEAD`
- `OPTIONS`

#### Static Routes

Use `static-route` for serving static files.

#### Examples

```clojure
;; Basic routes
(dsl/defroutes api-routes
  (dsl/GET "/health" [] health-handler)
  (dsl/POST "/api/users" [] create-user-handler)
  (dsl/PUT "/api/users/:id" [] update-user-handler)
  (dsl/DELETE "/api/users/:id" [] delete-user-handler))

;; Static file serving
(dsl/defroutes static-routes
  (dsl/static-route "/assets/*" {:root "./assets"
                                  :cache-control "max-age=31536000"})
  (dsl/static-route "/:package/*" {:root "./packages"
                                   :index ["index.html" "index.htm"]}))

;; Mixed routes
(dsl/defroutes full-routes
  (dsl/GET "/health" [] health-handler)
  (dsl/GET "/version" [] version-handler)
  (dsl/POST "/api/data" [] data-handler)
  (dsl/static-route "/static/*" {:root "./static"}))
```

### `defpackage-mounts`

Defines package discovery and mounting configuration.

#### Syntax

```clojure
(defpackage-mounts config-map)
```

#### Configuration Options

| Key | Type | Required | Default | Description |
|-----|------|----------|---------|-------------|
| `:scan-dirs` | vector | yes | - | Directories to scan for packages |
| `:exclude-patterns` | vector | no | [] | Regex patterns to exclude |
| `:mount-strategy` | keyword | no | :auto | Mount strategy (:auto, :manual, :lazy) |
| `:prefix-routes` | boolean | no | true | Add route prefixes |

#### Mount Strategies

- `:auto` - Automatically mount all discovered packages
- `:manual` - Manual package mounting
- `:lazy` - Lazy loading of packages

#### Examples

```clojure
;; Basic package mounts
(dsl/defpackage-mounts
  {:scan-dirs ["./packages"]})

;; Advanced configuration
(dsl/defpackage-mounts
  {:scan-dirs ["./packages" "./libs" "./external"]
   :exclude-patterns [#".*-test" #"test-.*" #".*-deprecated"]
   :mount-strategy :lazy
   :prefix-routes true})
```

### `defconfig`

Defines comprehensive configuration with environment variable support.

#### Syntax

```clojure
(defconfig name config-map)
```

#### Environment Variables

Use `env-or` to specify environment variables with fallback values.

#### Examples

```clojure
;; Basic configuration
(dsl/defconfig my-config
  {:server (dsl/server-config
             :port (dsl/env-or "PORT" 3000)
             :host (dsl/env-or "HOST" "localhost"))
   :packages (dsl/package-config
               :scan-dirs [(dsl/env-or "PACKAGES_DIR" "./packages")])})

;; Complex configuration
(dsl/defconfig production-config
  {:server (dsl/server-config
             :port (dsl/env-or "PORT" 80)
             :host "0.0.0.0"
             :cors {:origin (dsl/env-or "ALLOWED_ORIGIN" "https://example.com")
                   :methods [:get :post]})
   :security {:helmet true
              :rate-limit {:max 100 :timeWindow "1 minute"}}
   :metrics {:enabled true :endpoint "/metrics"}})
```

## Configuration DSL

### Configuration Builders

#### `server-config`

Creates server configuration.

```clojure
(dsl/server-config
  :port 3000
  :host "localhost"
  :packages-dir "./packages")
```

#### `package-config`

Creates package configuration.

```clojure
(dsl/package-config
  :scan-dirs ["./packages"]
  :auto-reload true
  :exclude-patterns [#".*-test"])
```

#### `static-config`

Creates static file configuration.

```clojure
(dsl/static-config
  :cache-control {:max-age 86400 :etag true}
  :gzip true)
```

#### `env-or`

Specifies environment variable with fallback.

```clojure
(dsl/env-or "PORT" 3000)
(dsl/env-or "NODE_ENV" "development")
(dsl/env-or "ENABLE_METRICS" false)
```

## Routing DSL

### Route Definition

#### HTTP Methods

```clojure
(dsl/GET "/path" [params] handler-fn)
(dsl/POST "/path" [params] handler-fn)
(dsl/PUT "/path" [params] handler-fn)
(dsl/DELETE "/path" [params] handler-fn)
(dsl/PATCH "/path" [params] handler-fn)
(dsl/HEAD "/path" [params] handler-fn)
(dsl/OPTIONS "/path" [params] handler-fn)
```

#### Static Routes

```clojure
(dsl/static-route "/static/*" {:root "./static"})
(dsl/static-route "/assets/*" {:root "./assets"
                                :cache-control "max-age=31536000"
                                :etag true})
```

#### Route Configuration

| Key | Type | Description |
|-----|------|-------------|
| `:root` | string | Root directory for static files |
| `:index` | vector | Index files to try |
| `:cache-control` | string | Cache control header |
| `:etag` | boolean | Enable ETag |
| `:gzip` | boolean | Enable gzip compression |

### Handler Functions

#### Health Handler

```clojure
(defn health-handler [_req reply]
  (.send reply (clj->js {:status "healthy"
                        :timestamp (js/Date.)})))
```

#### Version Handler

```clojure
(defn version-handler [_req reply]
  (.send reply (clj->js {:version "1.0.0"
                        :build-time (js/Date.)})))
```

## Package Management DSL

### Package Discovery

The DSL automatically discovers packages in specified directories:

1. Reads `package.json` for package name
2. Creates URL prefix from package name
3. Mounts `dist/frontend` and `static` directories

### Package Structure

```
package-name/
├── package.json          # Package metadata
├── dist/
│   └── frontend/         # Built frontend assets
├── static/               # Static assets
└── src/                  # Source files
```

### Mounting Behavior

- `@promethean/` packages use name after slash
- Other packages use full name
- Both `dist/frontend` and `static` are mounted if they exist

## Advanced Features

### Hot Reloading

```clojure
(dsl/defconfig development-config
  {:server (dsl/server-config :port 3001)
   :packages (dsl/package-config :auto-reload true)
   :development {:hot-reload true}})
```

### Metrics and Monitoring

```clojure
(dsl/defconfig monitored-config
  {:metrics {:enabled true
             :endpoint "/metrics"
             :defaultMetrics {:enabled true}}})
```

### Plugin System

```clojure
(dsl/defconfig plugin-config
  {:plugins [[:jwt {:secret "secret-key"}]
             [:auth {}]
             [:rate-limit {:max 100 :timeWindow "1 minute"}]]})
```

## Security DSL

### Security Configuration

```clojure
(dsl/defconfig secure-config
  {:security {:helmet true
              :rate-limit {:max 100 :timeWindow "1 minute"}
              :csrf true
              :jwt {:secret "jwt-secret"}}})
```

### Security Features

- **Helmet**: Security headers
- **Rate Limiting**: Request rate limiting
- **CSRF Protection**: Cross-site request forgery protection
- **JWT**: JSON Web Token authentication

### CORS Configuration

```clojure
(dsl/defserver cors-service
  {:port 3000
   :host "localhost"
   :cors {:origin "https://app.example.com"
           :methods [:get :post]
           :credentials true}})
```

## Testing DSL

### Test Configuration

```clojure
(dsl/defconfig test-config
  {:server (dsl/server-config :port 0) ; Random port
   :packages (dsl/package-config :scan-dirs ["./test-fixtures"])
   :testing {:mock-services true
             :fixtures {:enabled true}}})
```

### Testing Utilities

```clojure
(require '[promethean.frontend-service.dsl.testing :as dsl-test])

;; Create test server
(def test-server (dsl-test/create-test-server))

;; Create test configuration
(def test-config (dsl-test/create-test-config))

;; Benchmark performance
(def benchmark (dsl-test/benchmark-dsl-compilation config 1000))
```

### Test Examples

```clojure
(deftest test-server-creation
  (let [config {:port 3001 :host "localhost"}
        server (dsl-core/create-server-with-config config)]
    (is (instance? js/Promise server))))

(deftest test-route-validation
  (let [routes [{:method :GET :path "/test" :handler 'test-handler}]]
    (is (nil? (dsl/validate-routes routes)))))
```

## Migration Guide

### From Imperative to Declarative

#### Before (Imperative)

```clojure
(defn create-server []
  (let [app (Fastify)]
    (.register app fastifyStatic
               (clj->js {:root "./packages"
                         :prefix "/packages/"
                         :decorateReply false}))
    (.get app "/health" health-handler)
    (.listen app #js {:port 3000 :host "localhost"})))
```

#### After (Declarative)

```clojure
(dsl/defserver my-service
  {:port 3000
   :host "localhost"
   :packages-dir "./packages"
   :static-assets true
   :health-endpoint true})

(dsl/defroutes my-routes
  (dsl/GET "/health" [] health-handler)
  (dsl/static-route "/packages/*" {:root "./packages"}))
```

### Gradual Migration

1. **Phase 1**: Keep existing server, add DSL for new routes
2. **Phase 2**: Migrate configuration to DSL
3. **Phase 3**: Replace imperative code with DSL

```clojure
;; Phase 1: Mixed approach
(def old-app (create-imperative-server))
(def new-routes @dsl-routes)

;; Apply DSL routes to old app
(doseq [{:keys [method path handler]} new-routes]
  (dsl-core/register-route-handler old-app method path handler))
```

## Best Practices

### Configuration Management

1. **Environment-Specific Configs**: Separate configs for dev/test/prod
2. **Environment Variables**: Use `env-or` for sensitive values
3. **Validation**: Let the DSL validate configurations
4. **Composition**: Compose configurations from smaller pieces

```clojure
;; Good: Environment-specific
(dsl/defconfig development-config
  {:server (dsl/server-config :port 3001)})

(dsl/defconfig production-config
  {:server (dsl/server-config :port 80)})

;; Good: Environment variables
(dsl/defconfig secure-config
  {:server (dsl/server-config
             :port (dsl/env-or "PORT" 3000)
             :host (dsl/env-or "HOST" "localhost"))})
```

### Security

1. **CORS**: Restrict origins in production
2. **Security Headers**: Enable helmet
3. **Rate Limiting**: Implement rate limits
4. **Authentication**: Use JWT for API routes

```clojure
;; Good: Security-focused
(dsl/defconfig secure-production-config
  {:server (dsl/server-config
             :cors {:origin "https://app.example.com"
                   :methods [:get :post]})
   :security {:helmet true
              :rate-limit {:max 100 :timeWindow "1 minute"}}})
```

### Performance

1. **Caching**: Set appropriate cache headers
2. **Compression**: Enable gzip/brotli
3. **Lazy Loading**: Use lazy mount strategy for large apps
4. **CDN**: Use CDN for static assets

```clojure
;; Good: Performance-optimized
(dsl/defconfig performance-config
  {:static (dsl/static-config
             :cache-control {:max-age 31536000 :etag true}
             :gzip true)
   :packages (dsl/package-config
               :mount-strategy :lazy)})
```

### Testing

1. **Test Configuration**: Use separate test config
2. **Mock Services**: Enable mocking in tests
3. **Fixtures**: Use test fixtures for consistent state
4. **Benchmarking**: Test performance with benchmarks

```clojure
;; Good: Test-friendly
(dsl/defconfig test-config
  {:server (dsl/server-config :port 0)
   :testing {:mock-services true
             :fixtures {:enabled true}}})
```

## API Reference

### Core Functions

#### `validate-server-config`

Validates server configuration.

```clojure
(dsl/validate-server-config config-map) -> validated-config
```

#### `validate-routes`

Validates route configuration.

```clojure
(dsl/validate-routes routes-vector) -> nil
```

#### `validate-package-mounts`

Validates package mounts configuration.

```clojure
(dsl/validate-package-mounts config-map) -> validated-config
```

#### `compile-server-config`

Compiles server configuration to runtime format.

```clojure
(dsl/compile-server-config config-map) -> compiled-config
```

#### `compile-routes`

Compiles routes to runtime format.

```clojure
(dsl/compile-routes routes-vector) -> compiled-routes
```

#### `compile-package-mounts`

Compiles package mounts configuration to runtime format.

```clojure
(dsl/compile-package-mounts config-map) -> compiled-config
```

### Core Implementation Functions

#### `create-server-with-config`

Creates a server instance from DSL configuration.

```clojure
(dsl-core/create-server-with-config config-map) -> server-promise
```

#### `create-router-with-routes`

Creates and configures routes from DSL definition.

```clojure
(dsl-core/create-router-with-routes routes-vector) -> router-instance
```

#### `create-package-mounts-with-config`

Creates package mounts from DSL configuration.

```clojure
(dsl-core/create-package-mounts-with-config config-map) -> package-mounts
```

#### `resolve-env-var`

Resolves environment variable with fallback.

```clojure
(dsl-core/resolve-env-var env-var default-value) -> resolved-value
```

#### `resolve-configuration`

Recursively resolves configuration with environment variables.

```clojure
(dsl-core/resolve-configuration config-map) -> resolved-config
```

### Utility Functions

#### `create-health-handler`

Creates a health check handler.

```clojure
(dsl-core/create-health-handler service-identity) -> handler-fn
```

#### `create-version-handler`

Creates a version endpoint handler.

```clojure
(dsl-core/create-version-handler) -> handler-fn
```

#### `apply-security-config`

Applies security configuration to Fastify instance.

```clojure
(dsl-core/apply-security-config app security-config) -> nil
```

#### `enable-metrics`

Enables metrics collection.

```clojure
(dsl-core/enable-metrics app metrics-config) -> nil
```

## Error Handling

### Validation Errors

The DSL provides comprehensive validation with helpful error messages:

```clojure
;; Invalid configuration
(dsl/defserver bad-server
  {:port 70000 ; Invalid port
   :host "localhost"})
;; Throws: Invalid server configuration - :port must be between 1 and 65535
```

### Runtime Errors

Runtime errors are caught and handled gracefully:

```clojure
;; Missing directory
(dsl/defpackage-mounts
  {:scan-dirs ["./non-existent"]})
;; Logs warning and continues with empty mounts
```

### Error Recovery

Implement error recovery patterns:

```clojure
(defn create-service-with-fallback []
  (try
    (dsl-core/create-server-with-config @production-config)
    (catch js/Error e
      (js/console.error "Production config failed, using fallback:" e)
      (dsl-core/create-server-with-config @fallback-config))))
```

## Performance Considerations

### Compilation Performance

- DSL compilation is fast (< 10ms for typical configurations)
- Large route sets (1000+ routes) compile in < 1 second
- Configuration resolution is optimized for performance

### Runtime Performance

- Generated code is optimized for performance
- Route ordering is optimized automatically
- Static file serving uses Fastify's optimized static plugin

### Memory Usage

- DSL configurations are lazy (delayed)
- Memory usage scales with configuration complexity
- Package mounts are created on-demand for lazy strategy

## Troubleshooting

### Common Issues

#### Configuration Validation Errors

```clojure
;; Problem: Missing required fields
(dsl/defserver bad-server {:port 3000})
;; Solution: Add required :host field
(dsl/defserver good-server {:port 3000 :host "localhost"})
```

#### Route Conflicts

```clojure
;; Problem: Duplicate routes
(dsl/defroutes bad-routes
  (dsl/GET "/test" [] handler1)
  (dsl/GET "/test" [] handler2))
;; Solution: Use unique paths or different methods
```

#### Package Discovery Issues

```clojure
;; Problem: Packages not found
(dsl/defpackage-mounts {:scan-dirs ["./wrong-path"]})
;; Solution: Verify directory exists and contains packages
```

### Debug Mode

Enable debug logging:

```clojure
(dsl/defconfig debug-config
  {:development {:debug-logging true}})
```

### Validation Helpers

Use validation functions for debugging:

```clojure
;; Validate configuration
(try
  (dsl/validate-server-config config)
  (catch js/Error e
    (js/console.error "Validation failed:" e)))
```

## Contributing

### Adding New DSL Features

1. Add specs to `dsl.cljs`
2. Implement core logic in `dsl/core.cljs`
3. Add tests in `dsl/testing.cljs`
4. Document in examples and this guide

### Testing

Run the test suite:

```bash
npm test
# or
pnpm test
```

Run DSL-specific tests:

```bash
npm test -- --grep "DSL"
```

## License

This DSL is part of the Promethean Framework and follows the same license terms.