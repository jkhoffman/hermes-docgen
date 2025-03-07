# Contributing to Hermes DocGen

Thank you for considering contributing to Hermes DocGen! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful, inclusive, and considerate in all interactions.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Any relevant logs or error messages
- Your environment (OS, Node.js version, etc.)

### Suggesting Features

If you have an idea for a new feature, please create an issue with:

- A clear and descriptive title
- A detailed description of the feature and its use case
- Examples of how the feature would work

### Pull Requests

We welcome pull requests! Here's how to submit one:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Run the tests (`pnpm test`)
5. Commit your changes (`git commit -am 'Add some feature'`)
6. Push to the branch (`git push origin feature/your-feature-name`)
7. Create a new Pull Request

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v10 or higher)

### Installation

1. Clone the repository: `git clone https://github.com/your-username/hermes-docgen.git`
2. Navigate to the project directory: `cd hermes-docgen`
3. Install dependencies: `pnpm install`

### Development Workflow

- Run tests: `pnpm test`
- Check code style: `pnpm run lint`
- Fix code style issues: `pnpm run lint:fix`
- Build the project: `pnpm run build`

## Testing

Please make sure your changes pass all tests before submitting a pull request. If you add new functionality, please also add relevant tests.

### Running Tests

```bash
pnpm test
```

## Code Style

We use Biome for code formatting and linting. Please make sure your code adheres to the project's style guidelines by running:

```bash
pnpm run check
```

Or to automatically fix issues:

```bash
pnpm run check:fix
```

## Documentation

If you're making changes to the API or adding new features, please update the documentation accordingly.

## Commits

We follow conventional commit messages. Please format your commit messages as follows:

```
type(scope): description

[optional body]

[optional footer]
```

Types include:
- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Changes that don't affect the code's meaning
- refactor: Code changes that neither fix bugs nor add features
- perf: Performance improvements
- test: Adding or fixing tests
- chore: Changes to the build process or auxiliary tools

## License

By contributing to Hermes DocGen, you agree that your contributions will be licensed under the project's MIT License.

Thank you for contributing!