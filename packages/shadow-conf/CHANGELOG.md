# Changelog

All notable changes to @promethean/shadow-conf will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation suite
- JSDoc comments for all public APIs
- Type definitions for better TypeScript support
- Error handling improvements
- Performance optimizations

### Changed
- Enhanced path resolution algorithm
- Improved error messages with context
- Better handling of edge cases

### Fixed
- Path normalization issues with nested directories
- Memory leaks in large file processing
- CLI argument parsing edge cases

---

## [0.0.0] - 2024-01-XX

### Added
- Initial release of @promethean/shadow-conf
- EDN to PM2 ecosystem configuration generation
- CLI tool for command-line usage
- TypeScript support with comprehensive type definitions
- Path normalization for cross-platform compatibility
- Support for apps, triggers, schedules, and actions
- Environment variable integration with dotenv
- Recursive EDN file discovery
- Comprehensive test suite

### Features

#### Core Functionality
- `generateEcosystem()` - Main API for generating PM2 configurations
- `loadEdnFile()` - Low-level EDN file parsing
- Path normalization against output directory
- EDN keyword to string conversion
- Concurrent file processing

#### CLI Tool
- `shadow-conf ecosystem` command
- Support for custom input/output directories
- Configurable output filename
- Comprehensive help system
- Error reporting with context

#### Configuration Support
- Application definitions with full PM2 options
- Event-based triggers
- Cron-based schedules
- Reusable action definitions
- Environment variable handling
- File watching configurations

#### Type Safety
- Complete TypeScript definitions
- Readonly types for immutability
- Generic type constraints
- Runtime validation

#### Testing
- Unit tests for all core functions
- Integration tests for complete workflows
- CLI testing
- Error condition testing
- Performance benchmarks

### Documentation
- README with quick start guide
- API documentation
- CLI usage guide
- EDN format specification
- Troubleshooting guide

### Dependencies
- jsedn for EDN parsing
- dotenv for environment variable support
- @promethean/pm2-helpers for PM2 integration

---

## [Future Plans]

### Planned Features

#### Version 0.1.0
- [ ] Plugin system for custom processors
- [ ] Configuration validation with JSON Schema
- [ ] Watch mode for automatic regeneration
- [ ] Configuration templates and scaffolding
- [ ] Performance metrics and reporting

#### Version 0.2.0
- [ ] Support for additional configuration formats (YAML, TOML)
- [ ] Configuration inheritance and merging
- [ ] Advanced automation types
- [ ] Integration with CI/CD pipelines
- [ ] Web-based configuration editor

#### Version 0.3.0
- [ ] Distributed configuration support
- [ ] Configuration versioning and rollback
- [ ] Advanced monitoring and alerting
- [ ] Multi-environment management
- [ ] Configuration encryption

### Potential Enhancements

#### Performance
- [ ] Streaming processing for large file sets
- [ ] Incremental updates and caching
- [ ] Parallel processing optimizations
- [ ] Memory usage improvements

#### Developer Experience
- [ ] VS Code extension for EDN editing
- [ ] Language server protocol support
- [ ] Interactive configuration builder
- [ ] Debug mode with detailed logging

#### Integration
- [ ] Docker integration
- [ ] Kubernetes support
- [ ] Cloud provider integrations
- [ ] Monitoring platform integrations

### Breaking Changes (Future)

#### Version 1.0.0
- [ ] Stable API with semantic versioning
- [ ] Potential CLI interface changes
- [ ] Configuration format refinements
- [ ] Dependency updates

---

## Release Notes

### Version 0.0.0 - Initial Release

This initial release provides the core functionality for converting EDN configurations to PM2 ecosystem files. It includes:

- **Core API**: Programmatic access to all functionality
- **CLI Tool**: Command-line interface for automation
- **Type Safety**: Full TypeScript support
- **Documentation**: Comprehensive guides and examples
- **Testing**: Extensive test coverage

#### Key Design Decisions

1. **EDN First**: Chose EDN for its readability and expressiveness
2. **TypeScript**: Ensured type safety and better developer experience
3. **Functional Programming**: Used pure functions for predictability
4. **Path Awareness**: Intelligent path resolution for different deployment scenarios
5. **Extensibility**: Designed architecture for future enhancements

#### Known Limitations

- Large file processing may require increased memory limits
- Path resolution assumes output directory as base
- Limited to EDN format (future versions will support more)
- No built-in configuration validation (planned for v0.1.0)

#### Migration Guide

Since this is the initial release, no migration is needed. Future versions will include migration guides for breaking changes.

---

## Contributing to Changelog

When contributing to the project, please update this changelog following these guidelines:

### Format

```markdown
## [Version] - Date

### Added
- New feature description
- Another new feature

### Changed
- Modified existing feature
- Updated behavior

### Deprecated
- Feature that will be removed in future

### Removed
- Removed feature

### Fixed
- Bug fix description
- Another bug fix

### Security
- Security fix description
```

### Guidelines

1. **Use Semantic Versioning**: Follow semver for version numbers
2. **Be Specific**: Clearly describe what changed
3. **Include Impact**: Mention if changes are breaking
4. **Group Changes**: Organize by type (Added, Changed, Fixed, etc.)
5. **Date Format**: Use YYYY-MM-DD format
6. **Link Issues**: Reference relevant issue numbers when applicable

### Example Entry

```markdown
### Added
- Support for custom automation types (#123)
- Configuration validation with JSON Schema (#124)

### Fixed
- Path resolution issue with nested directories (#125)
- Memory leak in large file processing (#126)
```

---

## Version History

### Development Timeline

- **2024-Q1**: Initial development and core functionality
- **2024-Q2**: Documentation and testing improvements
- **2024-Q3**: Performance optimizations and CLI enhancements
- **2024-Q4**: Plugin system and advanced features

### Release Cadence

- **Patch releases** (0.0.x): As needed for bug fixes
- **Minor releases** (0.x.0): Monthly for new features
- **Major releases** (x.0.0): Quarterly for breaking changes

### Support Policy

- **Current version**: Full support with bug fixes and security updates
- **Previous minor version**: Bug fixes only
- **Older versions**: No support (upgrade recommended)

---

## Security

### Security Updates

Security vulnerabilities will be addressed according to the following policy:

1. **Critical**: Immediate patch release
2. **High**: Patch release within 7 days
3. **Medium**: Patch release in next minor version
4. **Low**: Address in next major version

### Reporting Security Issues

To report security issues:

1. **Do not** use public issue tracker
2. **Email**: security@promethean.dev
3. **Include**: Detailed description and reproduction steps
4. **Response**: Within 48 hours with initial assessment

### Security Changelog

Security updates will be documented in a separate SECURITY.md file and referenced in this changelog.

---

## Acknowledgments

### Contributors

Thanks to everyone who has contributed to @promethean/shadow-conf:

- Core team members
- Community contributors
- Beta testers
- Documentation reviewers

### Dependencies

Special thanks to the maintainers of our dependencies:

- [jsedn](https://github.com/edn-format/jsedn) - EDN parsing
- [dotenv](https://github.com/motdotla/dotenv) - Environment variables
- [TypeScript](https://github.com/microsoft/TypeScript) - Type system

### Inspiration

This project was inspired by:

- The Clojure ecosystem and EDN format
- PM2's powerful process management
- The need for declarative configuration management
- Modern DevOps practices and infrastructure as code

---

For the most up-to-date information, visit the [GitHub repository](https://github.com/promethean/shadow-conf).