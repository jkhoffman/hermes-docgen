# Hermes DocGen

Hermes is an AI-powered documentation generator for TypeScript projects. It analyzes your TypeScript code and creates comprehensive Markdown documentation using modern AI capabilities.

## Features

- Parses TypeScript files and extracts:
  - Functions and their signatures
  - Classes with properties and methods
  - Interfaces and their members
  - Enums and their values
  - Type aliases

- Generates Markdown documentation with:
  - Type signatures
  - Parameters and return types
  - Source file links
  - Table of contents with proper navigation

- AI-powered enhancements:
  - Improved descriptions
  - Automatic example generation
  - Clear explanations of complex types

## Installation

```bash
npm install -g hermes-docgen
```

## Usage

### Generating Documentation

To generate documentation for your TypeScript project:

```bash
hermes generate "src/**/*.ts" --output docs
```

### CLI Options

- `generate <patterns...>`: Generate documentation for files matching the patterns
  - `-o, --output <directory>`: Output directory (default: "./docs")
  - `-c, --config <file>`: Path to configuration file

- `init`: Create a new configuration file in the current directory
  - `-f, --force`: Overwrite existing configuration file

### Configuration

Hermes can be configured using a `.hermesrc.json` file in your project root. You can generate a default configuration file with:

```bash
hermes init
```

Example configuration:

```json
{
  "outDir": "./docs",
  "include": ["src/**/*.ts"],
  "exclude": ["**/*.test.ts", "**/*.spec.ts"],
  "title": "API Documentation",
  "markdownOptions": {
    "tocDepth": 3,
    "linkReferences": true,
    "includeTypes": true,
    "includeExamples": true
  },
  "ai": {
    "enabled": true,
    "provider": "openai",
    "enhanceComments": true,
    "generateExamples": false
  }
}
```

## Development

### Prerequisites

- Node.js 18 or higher
- npm or pnpm

### Building

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm run dev

# Build
pnpm run build

# Run tests
pnpm test
```

## License

ISC License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
