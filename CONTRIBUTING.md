# Contributing to CarValueAI

Thank you for considering contributing to the CarValueAI project! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. Fork the repository on GitHub
2. Clone your forked repository locally
3. Create a new branch for your contribution
4. Make your changes
5. Push your changes to your fork
6. Submit a pull request to the main repository

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the required environment variables (see README.md)

3. Set up the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

## Coding Style

- Follow the existing code style
- Use TypeScript for all new code
- Document all new functions and components
- Write descriptive commit messages

## Pull Request Process

1. Ensure your code follows the project's coding style
2. Update the README.md if necessary with details of changes
3. The PR should work for all supported environments
4. Include screenshots or GIFs for UI changes

## Adding New Translations

1. Locate the translation files in `client/src/lib/translations.ts`
2. Add new translations following the existing structure
3. Ensure all components use the translation system
4. Test the translations in both English and Bulgarian

## Adding New Features

1. Discuss new features in GitHub issues before implementation
2. Follow the existing architecture patterns
3. Write tests for new functionality
4. Document new features in the README.md

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.