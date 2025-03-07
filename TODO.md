# Hermes TODO List

This document outlines the tasks for Hermes, our AI-powered documentation generator for TypeScript. Version 0.1.0 has been released, establishing the core foundations of the project.

## Project Setup

- [x] Initialize TypeScript project with proper tsconfig.json
- [x] Configure Biome for formatting and linting
- [x] Set up Jest/Vitest for testing framework
- [x] Create GitHub repository with proper structure
- [x] Configure CI/CD pipeline for basic testing
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
- [x] Create v0.1.0 tag and release
  - After pushing to GitHub, create a new release with tag v0.1.0
  - Include release notes summarizing the features in v0.1.0
- [ ] Publish package to npm
  - Create an NPM token (if not already done)
  - Add the NPM token as a secret named NPM_TOKEN in the GitHub repository
  - The GitHub workflow will handle publishing when a release is created

## Version 0.2.0 - Enhanced Parsing

**Objectives**: Improve TypeScript parsing and Markdown generation.

### Features

- [ ] Extended TypeScript parsing
  - [ ] Enhance handling for classes with methods and properties
  - [ ] Improve interface parsing with property descriptions
  - [ ] Add robust type alias support
  - [ ] Add handling for namespaces
  - [ ] Populate parameter descriptions from function JSDoc @param tags
  - [ ] Add handling for JSDoc @example tags
  
- [ ] JSDoc comment extraction
  - [ ] Implement comment-parser for JSDoc extraction
  - [ ] Parse all standard JSDoc tags (@param, @returns, @example, etc.)
  - [ ] Link JSDoc references to their definitions
  
- [ ] Basic documentation structure
  - [ ] Organize documentation by module structure
  - [ ] Create index files for navigation
  - [ ] Generate breadcrumb navigation
  
- [ ] Improved Markdown formatting
  - [ ] Use GitHub-flavored markdown heading links
  - [ ] Support deeper nesting in the table of contents
  - [ ] Use relative paths in source links
  - [ ] Add rendering for JSDoc @example tags
  - [ ] Improve code block formatting with syntax highlighting

### Technical Implementation

- [ ] Enhance TypeScript parser
  - [ ] Reduce code duplication in traversal functions
  - [ ] Fix typing issue with `sourceFile: any`
  - [ ] Improve error handling with more specific types
  
- [ ] CLI Improvements
  - [ ] Add progress indicators for the generate command
  - [ ] Extract command handlers to separate modules
  - [ ] Add more customization options for the init command
  
- [ ] Configuration Enhancements
  - [ ] Improve nested configuration merging (deep merge)
  - [ ] Add validation for file paths
  - [ ] Support for output format options
  
- [ ] Generator Improvements
  - [ ] Use more unique identifiers for file grouping
  - [ ] Add more specific error types and context
  - [ ] Support for incremental generation

### Testing

- [ ] Test with complex TypeScript files
  - [ ] Test with real-world TypeScript projects
  - [ ] Create specific test cases for edge cases
  
- [ ] Verify JSDoc extraction and rendering
  - [ ] Test with various JSDoc formats and styles
  - [ ] Verify linking between references works correctly

### Release Criteria

- [ ] Successfully extract and document all major TypeScript constructs
- [ ] Properly incorporate existing JSDoc comments into documentation
- [ ] Documentation is well-organized and navigable
- [ ] All tests pass with high coverage

## v0.1.0 Success Criteria (Completed)

For v0.1.0 to be considered complete, the following criteria must be met:

1. ✅ CLI can successfully parse basic TypeScript files
2. ✅ Documentation can be generated in Markdown format for functions
3. ✅ Configuration can be loaded from file or CLI options
4. ✅ All tests pass
5. ✅ Documentation for usage is complete

## Future Versions

For detailed roadmap of future versions (v0.3.0 through v1.0.0), please see ROADMAP.md.
