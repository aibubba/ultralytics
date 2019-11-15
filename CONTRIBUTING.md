# Contributing to Ultralytics

First off, thank you for considering contributing to Ultralytics! It's people like you that make Ultralytics such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct: be respectful, inclusive, and professional.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Describe the behavior you observed and what you expected**
- **Include your environment details** (Node.js version, OS, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed enhancement**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Run the tests to make sure everything works
5. Commit your changes with a clear commit message
6. Push to your fork
7. Open a Pull Request

## Development Setup

1. Clone your fork:
   ```bash
   git clone https://github.com/your-username/ultralytics.git
   cd ultralytics
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

4. Set up a PostgreSQL database and update `.env`

5. Run the schema:
   ```bash
   psql -d ultralytics -f schema.sql
   ```

6. Start the development server:
   ```bash
   npm start
   ```

## Code Style

- Use 2 spaces for indentation
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Follow existing code patterns

### JavaScript Style Guide

- Use `const` by default, `let` when reassignment is needed
- Use arrow functions for callbacks
- Use template literals for string interpolation
- Always handle promise rejections

## Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Keep the first line under 50 characters
- Reference issues and pull requests in the body

## Testing

- Write tests for new features
- Update tests when modifying existing functionality
- Ensure all tests pass before submitting a PR

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing!
