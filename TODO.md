# Hermes v0.1.0 TODO List

This document outlines the essential tasks for delivering the first version (v0.1.0) of Hermes, our AI-powered documentation generator for TypeScript. The focus for this version is establishing the core foundations of the project.

## Project Setup

- [x] Initialize TypeScript project with proper tsconfig.json
- [x] Configure Biome for formatting and linting
- [x] Set up Jest/Vitest for testing framework
- [ ] Create GitHub repository with proper structure
- [ ] Configure CI/CD pipeline for basic testing
- [x] Set up package.json with proper dependencies
- [x] Create developer documentation for setup

## Core Infrastructure

- [x] Implement basic CLI structure using Commander.js
  - [x] Define basic command structure (generate, init, help)
  - [x] Set up command argument and option parsing
  - [x] Create help text and documentation
  - [x] Implement error handling for CLI

- [x] Create configuration system
  - [x] Define minimal configuration schema with Zod
  - [x] Implement configuration loading with cosmiconfig
  - [x] Add support for CLI overrides of config options
  - [x] Create default configuration

## TypeScript Parsing

- [x] Integrate ts-morph for TypeScript parsing
  - [x] Set up Project class wrapper
  - [x] Implement basic file loading from patterns
  - [x] Create source file processing pipeline

- [x] Create basic AST traversal system
  - [x] Parse functions and their signatures
  - [x] Extract basic types and interfaces
  - [x] Collect basic JSDoc comments
  - [x] Create data structures for documentation objects

## Markdown Generation

- [x] Implement Markdown generation system
  - [x] Create basic Markdown templates
  - [x] Implement function signature formatting
  - [x] Add basic linking between documents
  - [x] Generate table of contents

- [x] Set up file output system
  - [x] Implement file path resolution
  - [x] Create directory structure
  - [x] Handle file writing with proper error handling

## Testing

- [x] Write unit tests for core components
  - [x] CLI command tests
  - [x] Configuration loading tests
  - [x] TypeScript parsing tests
  - [x] Markdown generation tests

- [x] Create integration tests
  - [x] End-to-end test with simple TypeScript file
  - [x] Test with sample project

## Documentation

- [x] Create project README.md
- [x] Write usage documentation
- [x] Document configuration options
- [x] Add contributing guidelines

## Release Preparation

- [x] Perform code review of all components
- [x] Run full test suite
- [x] Test with sample TypeScript projects
- [ ] Create v0.1.0 tag and release
- [ ] Publish package to npm

## Future Improvements (v0.2.0+)

- [ ] CLI Improvements:
  - [ ] Add progress indicators for the generate command
  - [ ] Extract command handlers to separate modules
  - [ ] Add more customization options for the init command

- [ ] Configuration Enhancements:
  - [ ] Improve nested configuration merging (deep merge)
  - [ ] Add validation for file paths

- [ ] Parser Refinements:
  - [ ] Add handling for namespaces
  - [ ] Populate parameter descriptions from function JSDoc @param tags
  - [ ] Add better handling for JSDoc @example tags
  - [ ] Reduce code duplication in traversal functions
  - [ ] Fix typing issue with `sourceFile: any`

- [ ] Markdown Formatting:
  - [ ] Use GitHub-flavored markdown heading links
  - [ ] Support deeper nesting in the table of contents
  - [ ] Use relative paths in source links
  - [ ] Add rendering for @example JSDoc tags

- [ ] Generator Improvements:
  - [ ] Use more unique identifiers for file grouping
  - [ ] Add more specific error types and context
  - [ ] Implement AI integration features

## Success Criteria

For v0.1.0 to be considered complete, the following criteria must be met:

1. CLI can successfully parse basic TypeScript files
2. Documentation can be generated in Markdown format for functions
3. Configuration can be loaded from file or CLI options
4. All tests pass
5. Documentation for usage is complete
