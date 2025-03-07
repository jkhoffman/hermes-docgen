# CLAUDE.md - Hermes DocGen Development Guide

## Build Commands
- `pnpm lint` - Run linter on src files
- `pnpm lint:fix` - Run linter with auto-fixes
- `pnpm format` - Check formatting
- `pnpm format:fix` - Fix formatting issues
- `pnpm check` - Run Biome checks
- `pnpm check:fix` - Run Biome checks with fixes
- `pnpm check:unsafe` - Run Biome checks with unsafe fixes

## Testing Approach
- `pnpm test` - Run all tests
- `pnpm vitest run <test-file>` - Run a specific test file
- **Methodology**: Follow Test-Driven Development (TDD) approach
- **Coverage**: Aim for high test coverage of core functionality
- **Test Types**: Write unit tests for functions, integration tests for modules

## Code Style Guidelines
- **Formatting**: Use tabs for indentation, double quotes for strings
- **Imports**: Organize imports automatically with Biome
- **Types**: Use strict TypeScript with explicit typing
- **Error Handling**: Use neverthrow Result pattern for error handling
- **Naming**: Use camelCase for variables/functions, PascalCase for classes/interfaces
- **Components**: Follow modular design with clear separation of concerns
- **Patterns**: Prefer functional programming patterns over imperative ones
- **State**: Minimize mutable state, use immutable data structures where possible
- **Functions**: Prefer pure functions with explicit inputs and outputs
- **Dependency Injection**: Use DI pattern where appropriate to improve testability
- **Testing**: Design components with testing in mind, avoid hard-to-test implementations
- **Utilize dependencies**: Fully utilize project dependencies to avoid unnecessary effort

## Project Overview
Hermes is an AI-powered documentation generator for TypeScript projects that creates comprehensive Markdown documentation using modern AI capabilities.
