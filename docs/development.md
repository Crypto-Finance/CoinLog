# Development Guide

This guide covers the development workflow for CoinLog.

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest tests |

### Code Quality

- TypeScript strict mode enabled
- ESLint with Next.js core-web-vitals config
- Prettier-style formatting via ESLint
- Component size guidelines (<50 lines preferred)
- Function length guidelines (<30 lines preferred)

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Run E2E tests (requires Playwright browsers)
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Standards

- TypeScript strict mode compliance
- Follow existing code patterns (SRP, DRY, KISS)
- Add tests for new features
- Update documentation as needed
- Run `npm run lint` and `npm test` before submitting
