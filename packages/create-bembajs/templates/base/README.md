# BembaJS Application

Welcome to your new BembaJS application! This is a professional base template for building modern web applications using the Bemba programming language.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
bemba-app/
├── amapeji/              # Pages (file-based routing)
│   ├── index.bemba      # Home page
│   └── about.bemba      # About page
├── ifikopo/             # Reusable components
│   ├── Button.bemba     # Button component
│   └── Card.bemba       # Card component
├── maapi/               # API routes
│   ├── hello.bemba      # Hello API
│   └── users.bemba      # Users API
├── imikalile/           # Global styles
├── mafungulo/           # Static assets
├── mahooks/             # Custom hooks
├── macontext/           # Context providers
├── mautils/             # Utility functions
├── package.json         # Dependencies
├── bemba.config.js      # BembaJS configuration
└── README.md           # This file
```

## 🎯 Features

- ✅ **File-based Routing** - Pages in `amapeji/` folder
- ✅ **Component System** - Reusable components in `ifikopo/`
- ✅ **API Routes** - Server-side API endpoints in `maapi/`
- ✅ **Control Flow Syntax** - Conditionals (`ngati`, `kapena`), loops (`kwa`, `pamene`)
- ✅ **Error Handling** - Try/catch (`linga`, `kwata`, `paumalilo`)
- ✅ **Async/Await** - Full async support (`lombako`, `leka`)
- ✅ **Component Wrappers** - Shadcn, MUI, Chakra UI support
- ✅ **Server-Side Rendering (SSR)** - Full SSR support
- ✅ **Static Site Generation (SSG)** - Pre-rendered pages
- ✅ **Hot Module Replacement** - Fast development
- ✅ **TypeScript Support** - Optional TypeScript
- ✅ **CSS-in-Bemba** - Scoped styling
- ✅ **Bemba Language** - Program in Bemba!

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Lint your code
- `npm run format` - Format your code
- `npm test` - Run tests

### BembaJS CLI Commands

- `bemba panga <name>` - Create new project
- `bemba tungulula` - Start development server
- `bemba akha` - Build for production
- `bemba lint` - Lint Bemba code
- `bemba format` - Format Bemba code

## 📝 Bemba Language Syntax

### Creating Pages

```bemba
pangaIpepa('Home', {
    umutwe: 'Welcome',
    ilyashi: 'This is my home page',
    ifiputulwa: [
        {
            umutwe: 'Section Title',
            ilyashi: 'Section content',
            amabatani: [
                {
                    ilembo: 'Click Me',
                    pakuKlikisha: 'londolola("Hello!")'
                }
            ]
        }
    ]
});
```

### Creating Components

```bemba
fyambaIcipanda('Button', {
    ifiputulwa: {
        ilembo: 'Button',
        pakuKlikisha: 'londolola("Clicked!")'
    },
    imikalile: `
        .button {
            padding: 12px 24px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
        }
    `
});
```

### Creating API Routes

```bemba
pangaApi('hello', {
    method: 'GET',
    handler: `
        return {
            status: 200,
            data: { message: 'Hello from BembaJS!' }
        };
    `
});
```

### New in v1.3.0: Control Flow Syntax

```bemba
// Conditionals
ngati (condition) {
    umutwe: 'Condition is true'
} kapena {
    umutwe: 'Condition is false'
}

// Loops
kwa (item mu array) {
    { ilembo: item }
}

// Error handling
linga {
    // code that might fail
} kwata (error) {
    londololaError('Ifipushi: ' + error.message);
} paumalilo {
    // cleanup code
}

// Async/await
lombako nokuti fetchData() {
    const data = leka fetch('/api/data');
    bwelela leka data.json();
}
```

## 🎨 Styling

BembaJS supports CSS-in-Bemba for component-scoped styling:

```bemba
imikalile: `
    .my-component {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
    }
`
```

## 🔧 Configuration

Edit `bemba.config.js` to customize your application:

```javascript
module.exports = {
  name: 'my-app',
  framework: 'nextjs-like',
  folders: {
    pages: 'amapeji',
    components: 'ifikopo',
    api: 'maapi'
  },
  features: {
    routing: true,
    ssr: true,
    ssg: true
  }
};
```

## 📚 Learn More

- [BembaJS Documentation](https://bembajs.dev/docs)
- [Bemba Language Guide](https://bembajs.dev/bemba)
- [Component API](https://bembajs.dev/components)
- [API Routes](https://bembajs.dev/api)
- [Deployment Guide](https://bembajs.dev/deploy)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://bembajs.dev/contributing) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using BembaJS** 🇿🇲
