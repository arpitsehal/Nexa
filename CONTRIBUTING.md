# Contributing to NexaNews 🎉

First off, thank you for considering contributing to **NexaNews**! 🙌  
All contributions — big or small — are warmly welcome. Whether it's fixing a typo, reporting a bug, or building a feature, you're helping make NexaNews better for everyone.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Style Guidelines](#style-guidelines)
- [License](#license)

---

## Code of Conduct

By participating in this project, you agree to be respectful, constructive, and inclusive. Harassment or harmful behavior of any kind will not be tolerated.

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/nexanews.git
   cd nexanews
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Set up environment variables:**
   Copy `.env.example` to `.env` and fill in your own API keys:
   ```bash
   cp .env.example .env
   ```
   > ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

5. **Start the dev server:**
   ```bash
   npm run dev
   ```

---

## How to Contribute

### Reporting Bugs

If you find a bug, please [open an issue](https://github.com/arpitsehal/nexanews/issues/new) and include:

- A clear and descriptive title
- Steps to reproduce the problem
- Expected vs. actual behaviour
- Screenshots (if applicable)
- Your OS, browser, and Node.js version

### Suggesting Features

Have an idea? Open a [Feature Request issue](https://github.com/arpitsehal/nexanews/issues/new) and describe:

- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

### Submitting Pull Requests

1. **Create a new branch** off `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** and test them locally.
3. **Lint your code:**
   ```bash
   npm run lint
   ```
4. **Commit** with a clear and descriptive message following [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add dark mode toggle
   fix: resolve infinite scroll bug on mobile
   docs: update README with setup instructions
   ```
5. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** against the `main` branch and fill in the PR template.

> Please ensure your PR:
> - Has a clear description of **what** changed and **why**
> - Doesn't break existing functionality
> - Follows the style guidelines below

---

## Development Setup

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| Vite | ^8.x |
| React | ^19.x |

### Key Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
nexanews/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Route-level page components
│   ├── services/      # API and data-fetching logic
│   ├── firebase.js    # Firebase configuration
│   ├── App.jsx        # Root application component
│   └── index.css      # Global styles
├── .env.example       # Template for environment variables
├── index.html         # HTML entry point
└── vite.config.js     # Vite configuration
```

---

## Style Guidelines

- **JavaScript / JSX**: Follow the existing ESLint config (`eslint.config.js`). Use functional components and React hooks.
- **CSS**: Use vanilla CSS and follow the existing design tokens in `index.css`. Avoid inline styles where possible.
- **Naming**: Use `camelCase` for variables/functions, `PascalCase` for React components, and `kebab-case` for CSS classes.
- **Comments**: Add comments for complex logic, but keep code self-explanatory where possible.

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

---

Made with ❤️ by [Arpit Sehal](https://github.com/arpitsehal)
