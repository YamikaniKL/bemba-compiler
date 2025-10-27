# BembaJS

<div align="center">

![BembaJS Logo](https://ik.imagekit.io/1umfxhnju/bemba-logo.svg?updatedAt=1761557358350)

**A Next.js-like framework for programming in the Bemba language**

**Version 1.1.0 "Cisokolola" (The Beginning)**

[![npm version](https://badge.fury.io/js/bembajs.svg)](https://www.npmjs.com/package/bembajs)
[![npm downloads](https://img.shields.io/npm/dm/bembajs.svg)](https://www.npmjs.com/package/bembajs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue)](https://marketplace.visualstudio.com/items?itemName=bembajs.bembajs-language-support)

*Programming in Bemba Language - Made Easy!*

</div>

---

## Quick Start

### Create Your First BembaJS App

```bash
# Create a new project
npm create bembajs@latest my-app

# Navigate to your project
cd my-app

# Install dependencies
npm install

# Start development server
npm run dev
```

**That's it!** Open [http://localhost:3000](http://localhost:3000) to see your app running.

---

## Features

- **File-based Routing** - Automatic routing based on file structure
- **Component System** - Reusable components with props
- **API Routes** - Server-side API endpoints
- **State Management** - Component state with effects
- **Event Handling** - Comprehensive event system
- **Props Validation** - Type-safe component props
- **Built-in Functions** - Utility functions in Bemba language
- **Error Messages** - Complete error system in Bemba
- **VS Code Support** - Syntax highlighting and snippets
- **Hot Reload** - Instant updates during development
- **Production Ready** - Optimized builds and deployment

---

## Language Syntax Reference

<details>
<summary><strong>Basic Syntax - Pages, Components & API Routes</strong></summary>

### Creating Pages (`pangaIpepa`)

```bemba
pangaIpepa('Home', {
    umutwe: 'Page Title',
    ilyashi: 'Page description with <a href="#">inline HTML</a>',
    ifiputulwa: [
        {
            umutwe: 'Section Title',
            ilyashi: 'Section content',
            amalembelo: [
                'Step one',
                'Step two',
                'Step three'
            ],
            amabatani: [
                {
                    ilembo: 'Button Text',
                    pakuKlikisha: 'londolola("Hello!")'
                }
            ]
        }
    ]
});
```

### Creating Components (`fyambaIcipanda`)

```bemba
fyambaIcipanda('ComponentName', {
    ificingilila: {
        izina: { type: 'string', required: true },
        umaka: { type: 'number', default: 0 }
    },
    ifiputulwa: {
        umutwe: props.izina,
        ilyashi: `Age: ${props.umaka} years old`
    }
});
```

### Creating API Routes (`pangaApi`)

```bemba
pangaApi('users', {
    method: 'GET',
    handler: `
        return {
            status: 200,
            data: { message: 'Hello from BembaJS API' }
        };
    `
});
```

</details>

<details>
<summary><strong>State Management</strong></summary>

### Basic State (`ukusunga`)

```bemba
fyambaIcipanda('Counter', {
    ifiputulwa: {
        ukusunga: {
            namba: 0,
            izina: '',
            wasalwa: false
        },
        amabatani: [
            {
                ilembo: 'Onjela: ' + namba,
                pakuKlikisha: 'ukuCinja("namba", namba + 1)'
            }
        ]
    }
});
```

### State with Effects (`ukusungaKabili`)

```bemba
fyambaIcipanda('DataComponent', {
    ifiputulwa: {
        ukusungaKabili: {
            data: [],
            loading: true,
            effect: `
                fetch('/api/data')
                    .then(res => res.json())
                    .then(data => {
                        ukuCinja('data', data);
                        ukuCinja('loading', false);
                    });
            `
        }
    }
});
```

### State Updates (`ukuCinja`)

```bemba
// Update single state
ukuCinja('namba', namba + 1)

// Update multiple states
ukuCinja('izina', 'John')
ukuCinja('wasalwa', true)
```

</details>

<details>
<summary><strong>Event Handling</strong></summary>

### Click Events (`pakuKlikisha`)

```bemba
amabatani: [
    {
        ilembo: 'Click Me',
        pakuKlikisha: 'londolola("Button clicked!")'
    }
]
```

### Input Events (`pakuLemba`)

```bemba
inputs: [
    {
        type: 'text',
        placeholder: 'Lemba izina',
        pakuLemba: 'ukuCinja("izina", event.target.value)'
    }
]
```

### Form Events (`pakuTumina`)

```bemba
forms: [
    {
        pakuTumina: `
            event.preventDefault();
            londolola('Form submitted!');
        `
    }
]
```

### Other Events

- `pakuCinja` - Select change events
- `pakuIngia` - Focus events
- `pakuFuma` - Blur events
- `pakuKwesha` - Mouse enter events
- `pakuSiya` - Mouse leave events

</details>

<details>
<summary><strong>Component Props & Validation</strong></summary>

### Props Definition (`ificingilila`)

```bemba
fyambaIcipanda('UserCard', {
    ificingilila: {
        izina: { 
            type: 'string', 
            required: true 
        },
        umaka: { 
            type: 'number', 
            default: 0 
        },
        ifoto: { 
            type: 'string' 
        },
        wasalwa: {
            type: 'boolean',
            default: false
        }
    },
    ifiputulwa: {
        umutwe: props.izina,
        ilyashi: `Age: ${props.umaka} years old`
    }
});
```

### Prop Types

- `string` - Text values
- `number` - Numeric values
- `boolean` - True/false values
- `array` - List of items
- `object` - Key-value pairs
- `function` - Callback functions

</details>

<details>
<summary><strong>Styling</strong></summary>

### CSS Styles (`imikalile`)

```bemba
fyambaIcipanda('StyledComponent', {
    ifiputulwa: {
        umutwe: 'Styled Component'
    },
    imikalile: `
        .component {
            background: white;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .component h1 {
            color: #333;
            margin: 0 0 16px 0;
        }
    `
});
```

### Tailwind CSS Integration

BembaJS includes Tailwind CSS by default for utility-first styling.

</details>

<details>
<summary><strong>Forms & Validation</strong></summary>

### Form Handling

```bemba
fyambaIcipanda('ContactForm', {
    ifiputulwa: {
        ukusunga: {
            izina: '',
            email: '',
            message: '',
            emailError: ''
        },
        forms: [
            {
                inputs: [
                    {
                        type: 'text',
                        name: 'izina',
                        placeholder: 'Lemba izina lyobe',
                        pakuLemba: 'ukuCinja("izina", event.target.value)',
                        required: true
                    },
                    {
                        type: 'email',
                        name: 'email',
                        placeholder: 'Email yobe',
                        pakuLemba: `
                            ukuCinja('email', event.target.value);
                            if (!event.target.value.includes('@')) {
                                ukuCinja('emailError', 'Email yakufwile kuba na @');
                            } else {
                                ukuCinja('emailError', '');
                            }
                        `,
                        required: true
                    }
                ],
                pakuTumina: `
                    event.preventDefault();
                    londolola('Form submitted successfully!');
                `
            }
        ]
    }
});
```

### Input Types

- `text` - Text input
- `email` - Email input
- `password` - Password input
- `number` - Number input
- `textarea` - Multi-line text
- `checkbox` - Checkbox input
- `radio` - Radio button
- `select` - Dropdown select

</details>

<details>
<summary><strong>Data Fetching</strong></summary>

### Fetch API Integration

```bemba
fyambaIcipanda('DataComponent', {
    ifiputulwa: {
        ukusungaKabili: {
            data: [],
            loading: true,
            error: null,
            effect: `
                fetch('/api/users')
                    .then(res => res.json())
                    .then(data => {
                        ukuCinja('data', data);
                        ukuCinja('loading', false);
                    })
                    .catch(error => {
                        ukuCinja('error', error.message);
                        ukuCinja('loading', false);
                    });
            `
        }
    }
});
```

### API Routes

```bemba
pangaApi('users', {
    method: 'GET',
    handler: `
        const users = [
            { izina: 'John', umaka: 25 },
            { izina: 'Jane', umaka: 30 }
        ];
        
        return {
            status: 200,
            data: users
        };
    `
});
```

</details>

<details>
<summary><strong>Built-in Functions</strong></summary>

### Console Functions

```bemba
londolola('Hello World!')           // console.log
londololaError('Error occurred')     // console.error
londololaWarning('Warning message')  // console.warn
```

### String Functions

```bemba
ukuPima('Hello')           // string.length
ukuPindula('a', 'b')       // string.replace
ukuGawanya('a,b,c')        // string.split
ukuSanganya(['a','b','c']) // array.join
```

### Array Functions

```bemba
ukuOnjela(array, item)     // array.push
ukuCotola(array, index)    // array.splice
ukuPindula(array, fn)      // array.map
ukuSankha(array, fn)       // array.filter
```

### Math Functions

```bemba
ukuBalisha(a, b)           // addition
ukuCepula(a, b)            // subtraction
ukuCilisha(a, b)           // multiplication
ukuGawanya(a, b)           // division
```

</details>

---

## VS Code Support

### Automatic Installation

```bash
# Install BembaJS globally
npm install -g bembajs@latest

# Install VS Code language support
bemba install-ide
```

### Manual Installation

1. Install the [BembaJS Language Support](https://marketplace.visualstudio.com/items?itemName=bembajs.bembajs-language-support) extension
2. Open any `.bemba` file
3. Enjoy syntax highlighting and snippets!

### Features

- Syntax highlighting for Bemba keywords
- Code snippets for common patterns
- File association for `.bemba` files
- Custom icon for Bemba files
- Auto-completion and bracket matching

---

## Project Structure

```
my-app/
├── amapeji/           # Pages (file-based routing)
│   ├── index.bemba
│   └── about.bemba
├── ifikopo/           # Components
│   ├── Header.bemba
│   └── Footer.bemba
├── mafungulo/         # API routes
│   ├── users.bemba
│   └── posts.bemba
├── amashinda/         # Static assets
│   ├── images/
│   └── favicon.ico
├── imikalile/         # Styles
│   └── globals.css
├── bemba.config.js    # Configuration
└── package.json
```

---

## Configuration

### bemba.config.js

```javascript
module.exports = {
    // Development server port
    port: 3000,
    
    // Build output directory
    output: './dist',
    
    // Enable hot reload
    hotReload: true,
    
    // Open browser automatically
    openBrowser: true,
    
    // API server port
    apiPort: 3001,
    
    // Enable static site generation
    ssg: false,
    
    // Enable server-side rendering
    ssr: true,
    
    // Build optimizations
    optimize: true,
    
    // Routing configuration
    routing: {
        trailingSlash: false,
        caseSensitive: false
    }
};
```

---

## Error Messages

BembaJS provides error messages in the Bemba language:

- **Syntax Errors**: `Ifipushi fya syntax: [error details]`
- **Runtime Errors**: `Ifipushi fya kutantika: [error details]`
- **Validation Errors**: `Ifipushi fya kupepesha: [error details]`
- **Component Errors**: `Ifipushi fya component: [error details]`
- **API Errors**: `Ifipushi fya API: [error details]`

---

## Examples

Check out the `examples/` directory for:

- `state-management.bemba` - Counter component with state
- `form-handling.bemba` - Contact form with validation
- `props-validation.bemba` - UserCard with props and validation
- `api-route.bemba` - API endpoint example
- `basic-component.bemba` - Simple component example

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/YamikaniKL/bemba-compiler.git

# Install dependencies
npm install

# Run tests
npm test

# Build packages
npm run build
```

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Support

- **Documentation**: [GitHub Wiki](https://github.com/YamikaniKL/bemba-compiler/wiki)
- **Issues**: [GitHub Issues](https://github.com/YamikaniKL/bemba-compiler/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YamikaniKL/bemba-compiler/discussions)

---

<div align="center">

**Made with ❤️ for the Bemba-speaking developer community**

[Website](https://bembajs.dev) • [Documentation](https://github.com/YamikaniKL/bemba-compiler/wiki) • [Examples](https://github.com/YamikaniKL/bemba-compiler/tree/main/examples)

</div>