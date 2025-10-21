(ns promethean.frontend-service.types
  (:require [typed.clojure :as t])
  (:require-macros [typed.clojure.macros :as tm]))

;; Typed namespace annotation
(t/ann-ns promethean.frontend-service.types)

;; ============================================================================
;; CORE TYPE DEFINITIONS
;; ============================================================================

;; TypeScript ReadonlyDeep<T> equivalent - ClojureScript is naturally immutable
(t/defalias ReadonlyDeep
  "ClojureScript equivalent of TypeScript's ReadonlyDeep<T>
   Since ClojureScript data structures are immutable by default,
   this is essentially an identity type alias."
  t/Any)

;; Package directory information type
(t/defalias PackageDirInfo
  "Information about a package directory with fallback name"
  (t/HMap :mandatory {:pkgDir t/Str
                      :fallback t/Str}
          :complete? true))

;; Package name information type
(t/defalias PackageNameInfo
  "Package name wrapper"
  (t/HMap :mandatory {:name t/Str}
          :complete? true))

;; Package mount configuration
(t/defalias PackageMount
  "Package mount configuration with path and URL prefix"
  (t/HMap :mandatory {:pkgPath t/Str
                      :prefix t/Str}
          :complete? true))

;; Server creation options
(t/defalias CreateServerOptions
  "Options for creating the frontend service server"
  (t/HMap :optional {:packagesDir t/Str}
          :complete? false))

;; Service identity for health/diagnostics
(t/defalias ServiceIdentity
  "Service identity information"
  (t/HMap :optional {:serviceName t/Str}
          :complete? false))

;; ============================================================================
;; FASTIFY SERVER TYPES
;; ============================================================================

;; Fastify instance type - simplified interface for our use case
(t/defalias FastifyInstance
  "Fastify server instance with the methods we use"
  (t/TFn [[server :var]]
         (t/I
     ;; Register plugin method
          (t/IFn [t/Any t/Any] t/Any)
     ;; Get route method
          (t/IFn [t/Str (t/IFn [t/Any t/Any] t/Any)] t/Any)
     ;; Ready method
          (t/IFn [] (t/Promise t/Any))
     ;; Listen method
          (t/IFn [t/Any (t/U t/Nil (t/IFn [t/Any] t/Any))] (t/Promise t/Any))
     ;; Close method
          (t/IFn [] (t/Promise t/Any))
     ;; Inject method for testing
          (t/IFn [t/Str] (t/Promise t/Any)))))

;; Fastify static plugin options
(t/defalias FastifyStaticOptions
  "Options for fastify-static plugin"
  (t/HMap :mandatory {:root t/Str
                      :prefix t/Str
                      :decorateReply t/Bool}
          :complete? true))

;; ============================================================================
;; TEST TYPES
;; ============================================================================

;; Package fixture for testing
(t/defalias PackageFixture
  "Test fixture for package structure"
  (t/HMap :mandatory {:dir t/Str
                      :name t/Str}
          :optional {:distFiles (t/Map t/Str t/Str)
                     :staticFiles (t/Map t/Str t/Str)}
          :complete? false))

;; File write input for test fixtures
(t/defalias WriteFileInput
  "Input for writing files in tests"
  (t/HMap :mandatory {:filePath t/Str
                      :contents t/Str}
          :complete? true))

;; ============================================================================
;; UTILITY TYPES
;; ============================================================================

;; File system result types
(t/defalias FileExistsResult
  "Result of file existence check"
  t/Bool)

(t/defalias ReadJsonResult
  "Result of reading JSON file - can be undefined"
  (t/U t/Any t/Nil))

;; Package discovery result
(t/defalias PackageMountsResult
  "Result of package discovery - array of package mounts"
  (t/Vec PackageMount))

;; ============================================================================
;; ERROR TYPES
;; ============================================================================

;; Server error types
(t/defalias ServerError
  "Server-related errors"
  (t/I t/Any))

;; File system error types  
(t/defalias FileSystemError
  "File system operation errors"
  (t/I t/Any))

;; ============================================================================
;; ASYNC TYPES
;; ============================================================================

;; Server creation promise
(t/defalias ServerCreationPromise
  "Promise returned by server creation"
  (t/Promise FastifyInstance))

;; Server ready promise
(t/defalias ServerReadyPromise
  "Promise returned by server ready"
  (t/Promise t/Any))