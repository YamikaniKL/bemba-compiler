# BembaJS

<div align="center">

![BembaJS Logo](https://ik.imagekit.io/1umfxhnju/bemba-logo.svg?updatedAt=1761557358350)

**A Next.js-like framework for programming in the Bemba language** 🇿🇲

[![npm version](https://badge.fury.io/js/bembajs.svg)](https://www.npmjs.com/package/bembajs)
[![npm downloads](https://img.shields.io/npm/dm/bembajs.svg)](https://www.npmjs.com/package/bembajs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue)](https://marketplace.visualstudio.com/items?itemName=bembajs.bembajs-language-support)

*Programming in Bemba Language - Made Easy!*

</div>

---

## ✨ **What's New in Version 1.0**

🎉 **BembaJS Version 1.0** is here! This major release brings:

- 🎨 **VS Code Extension** - Full marketplace integration with syntax highlighting
- 🚀 **Next.js-like Styling** - Beautiful Tailwind CSS integration
- 🌍 **Rich Bemba Content** - Programming in authentic Bemba language
- ⚡ **Automatic IDE Support** - Works seamlessly like JavaScript files
- 📦 **Production Ready** - Optimized builds and deployment ready

---

## 🚀 **Quick Start**

### **Create Your First BembaJS App**

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

### **VS Code Extension (Recommended)**

For the best development experience, install the official VS Code extension:

1. **Open VS Code**
2. **Go to Extensions** (Ctrl+Shift+X)
3. **Search**: "BembaJS Language Support"
4. **Click Install**

Or install via command line:
```bash
code --install-extension bembajs.bembajs-language-support
```

---

## 🎨 **VS Code/Cursor Integration**

BembaJS now includes **professional IDE support** with:

### **✨ Features**
- 🎨 **Syntax Highlighting** - Full color-coded BembaJS keywords
- 🎯 **File Icons** - Custom icons for `.bemba` files
- 📝 **Code Snippets** - Auto-completion for common patterns
- 🚀 **Commands** - Right-click to create projects and start servers
- 🌍 **Language Support** - Complete BembaJS language integration

### **📦 Installation Options**

#### **Option 1: VS Code Marketplace (Recommended)**
```bash
# Install from marketplace
code --install-extension bembajs.bembajs-language-support
```

#### **Option 2: Global Installation**
```bash
# Install globally
npm install -g bembajs@latest

# Install IDE support
bemba install-ide
```

#### **Option 3: Automatic (New Projects)**
New BembaJS projects automatically include VS Code configuration:
```bash
npm create bembajs@latest my-app
# .bemba files automatically recognized!
```

---

## 🎯 **Core Features**

### **🌍 Bemba Language Programming**
Write web applications in the beautiful Bemba language:

```bemba
pangaIpepa('Home', {
    umutwe: 'Tantika ukupanga ukulemba',
    ilyashi: 'Bika na ukumona ifyakusendeka mwangu. Ya ku <a href="https://github.com/YamikaniKL/bemba-compiler">Learning Center</a>',
    ifiputulwa: [
        {
            umutwe: 'Ukutampa bwino',
            ilyashi: 'Lemba pali amapeji/index.bemba file',
            amabatani: [
                {
                    ilembo: 'Panga pa Vercel',
                    pakuKlikisha: 'window.open("https://vercel.com/new", "_blank")'
                },
                {
                    ilembo: 'Soma amakalata yetu',
                    pakuKlikisha: 'window.open("https://github.com/YamikaniKL/bemba-compiler", "_blank")'
                }
            ]
        }
    ]
});
```

### **🎨 Next.js-like Framework**
- ✅ **File-based Routing** - Pages in `amapeji/` directory
- ✅ **Component System** - Reusable components in `ifikopo/`
- ✅ **API Routes** - Server endpoints in `maapi/`
- ✅ **Static Assets** - Files in `maungu/` directory
- ✅ **Hot Reload** - Instant updates during development

### **⚡ Modern Development Experience**
- ✅ **Tailwind CSS** - Beautiful, responsive styling
- ✅ **TypeScript Support** - Optional type safety
- ✅ **Bun Optimization** - Native Bun support for faster builds
- ✅ **Production Ready** - Optimized builds for deployment

---

## 📦 **Packages**

This monorepo contains:

| Package | Description | Version |
|---------|-------------|---------|
| **`bembajs`** | Main framework with CLI and SDK | [![npm](https://img.shields.io/npm/v/bembajs.svg)](https://www.npmjs.com/package/bembajs) |
| **`create-bembajs`** | Project scaffolding tool | [![npm](https://img.shields.io/npm/v/create-bembajs.svg)](https://www.npmjs.com/package/create-bembajs) |
| **`bembajs-core`** | Core compiler (lexer, parser, transformer) | Internal |

---

## 🛠️ **CLI Commands**

```bash
# Create new project
bemba panga my-app

# Start development server
bemba tungulula

# Build for production
bemba akha

# Install IDE support
bemba install-ide

# Show help
bemba help
```

---

## 📖 **BembaJS Language Syntax Reference**

<details>
<summary><strong>📘 Basic Syntax - Pages, Components & API Routes</strong></summary>

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

**Keywords:**
- `pangaIpepa(name, config)` - Create a new page
- `umutwe` - Title/heading
- `ilyashi` - Description/paragraph (supports HTML)
- `ifiputulwa` - Content sections array
- `amalembelo` - Ordered list of steps
- `amabatani` - Buttons array
- `ilembo` - Button label
- `pakuKlikisha` - Click event handler

### Creating Components (`fyambaIcipanda`)

```bemba
fyambaIcipanda('Button', {
    ificingilila: {
        ilembo: { type: 'string', required: true },
        umitundu: { type: 'string', default: 'primary' }
    },
    ifiputulwa: {
        amabatani: [
            {
                ilembo: props.ilembo,
                pakuKlikisha: 'londolola("Clicked!")'
            }
        ]
    },
    imikalile: `
        .button {
            padding: 12px 24px;
            border-radius: 8px;
        }
        .button-primary {
            background: #667eea;
            color: white;
        }
    `
});
```

**Keywords:**
- `fyambaIcipanda(name, config)` - Create a component
- `ificingilila` - Props definition
- `ifiputulwa` - Component content
- `imikalile` - CSS styles

### Creating API Routes (`pangaApi`)

```bemba
pangaApi('users', {
    method: 'GET',
    handler: `
        return {
            status: 200,
            data: {
                users: [
                    { id: 1, izina: 'John' },
                    { id: 2, izina: 'Jane' }
                ]
            }
        };
    `
});
```

**Keywords:**
- `pangaApi(endpoint, config)` - Create API route
- `method` - HTTP method (GET, POST, PUT, DELETE)
- `handler` - Request handler function

</details>

<details>
<summary><strong>🔄 State Management - Data & Updates</strong></summary>

### Declaring State (`ukusunga`)

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

### Updating State (`ukuCinja`)

```bemba
// Update single value
ukuCinja('namba', namba + 1)

// Update with function
ukuCinja('izina', (prev) => prev + ' Banda')

// Update multiple values
ukuCinja({
    namba: 10,
    izina: 'John',
    wasalwa: true
})
```

### State with Effects (`ukusungaKabili`)

```bemba
fyambaIcipanda('DataLoader', {
    ifiputulwa: {
        ukusungaKabili: {
            data: null,
            effect: `
                fetch('/api/users')
                    .then(res => res.json())
                    .then(data => ukuCinja('data', data));
            `
        }
    }
});
```

**Keywords:**
- `ukusunga` - Declare component state
- `ukuCinja(name, value)` - Update state value
- `ukusungaKabili` - State with side effects

</details>

<details>
<summary><strong>🎯 Event Handling - User Interactions</strong></summary>

### Click Events (`pakuKlikisha`)

```bemba
amabatani: [
    {
        ilembo: 'Click Me',
        pakuKlikisha: 'londolola("Hello!")'
    }
]
```

### Input Events (`pakuLemba`)

```bemba
ifiputulwa: {
    inputs: [
        {
            type: 'text',
            placeholder: 'Lemba izina',
            pakuLemba: 'ukuCinja("izina", event.target.value)'
        }
    ]
}
```

### Form Submit (`pakuTumina`)

```bemba
forms: [
    {
        pakuTumina: `
            event.preventDefault();
            console.log('Form submitted:', izina);
        `
    }
]
```

### Change Events (`pakuCinja`)

```bemba
selects: [
    {
        options: ['Option 1', 'Option 2'],
        pakuCinja: 'ukuCinja("selected", event.target.value)'
    }
]
```

### Mouse Events

```bemba
// Mouse enter
pakuKwesha: 'ukuCinja("isHovering", true)'

// Mouse leave
pakuSiya: 'ukuCinja("isHovering", false)'
```

### Focus Events

```bemba
// On focus
pakuIngia: 'ukuCinja("isFocused", true)'

// On blur
pakuFuma: 'ukuCinja("isFocused", false)'
```

**All Event Handlers:**
- `pakuKlikisha` - onClick
- `pakuLemba` - onChange (for inputs)
- `pakuTumina` - onSubmit (for forms)
- `pakuCinja` - onChange (for selects)
- `pakuIngia` - onFocus
- `pakuFuma` - onBlur
- `pakuKwesha` - onMouseEnter
- `pakuSiya` - onMouseLeave

</details>

<details>
<summary><strong>📦 Component Props - Passing Data</strong></summary>

### Defining Props (`ificingilila`)

```bemba
fyambaIcipanda('UserCard', {
    ificingilila: {
        // Required string prop
        izina: { 
            type: 'string', 
            required: true 
        },
        
        // Optional number with default
        umaka: { 
            type: 'number', 
            default: 0 
        },
        
        // Optional string
        ifoto: { 
            type: 'string' 
        },
        
        // Boolean with default
        wasalwa: {
            type: 'boolean',
            default: false
        },
        
        // Array prop
        amafoto: {
            type: 'array',
            default: []
        }
    }
});
```

### Using Props in Components

```bemba
ifiputulwa: {
    umutwe: props.izina,
    ilyashi: 'Age: ' + props.umaka,
    ifoto: props.ifoto
}
```

### Passing Props

```bemba
// In parent component
ifikopo: [
    {
        name: 'UserCard',
        props: {
            izina: 'John Banda',
            umaka: 25,
            ifoto: '/john.jpg',
            wasalwa: true
        }
    }
]
```

### Children Props

```bemba
fyambaIcipanda('Container', {
    ificingilila: {
        children: { type: 'node' }
    },
    ifiputulwa: {
        wrapper: {
            content: props.children
        }
    }
});
```

**Prop Types:**
- `string` - Text values
- `number` - Numeric values
- `boolean` - True/false values
- `array` - List of items
- `object` - Complex objects
- `node` - Child components
- `function` - Callback functions

</details>

<details>
<summary><strong>🎨 Styling - CSS & Tailwind</strong></summary>

### Inline Styles (`imikalile`)

```bemba
fyambaIcipanda('StyledButton', {
    imikalile: `
        .button {
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        
        .button:active {
            transform: translateY(0);
        }
    `
});
```

### Scoped Styles

```bemba
// Styles are automatically scoped to the component
imikalile: `
    /* This only affects this component */
    .title {
        font-size: 24px;
        color: #333;
    }
`
```

### Dynamic Styles

```bemba
fyambaIcipanda('DynamicButton', {
    ifiputulwa: {
        ukusunga: {
            isActive: false
        }
    },
    imikalile: `
        .button {
            background: ${isActive ? '#667eea' : '#gray'};
            color: ${isActive ? 'white' : 'black'};
        }
    `
});
```

### Tailwind CSS Classes

```bemba
// Tailwind classes work automatically in BembaJS
amabatani: [
    {
        ilembo: 'Styled Button',
        classes: 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
    }
]
```

### CSS Variables

```bemba
imikalile: `
    :root {
        --primary-color: #667eea;
        --secondary-color: #764ba2;
        --spacing: 16px;
    }
    
    .button {
        background: var(--primary-color);
        padding: var(--spacing);
    }
`
```

</details>

<details>
<summary><strong>📝 Forms & Validation - User Input</strong></summary>

### Basic Form

```bemba
fyambaIcipanda('ContactForm', {
    ifiputulwa: {
        ukusunga: {
            izina: '',
            email: '',
            message: ''
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
                        pakuLemba: 'ukuCinja("email", event.target.value)',
                        required: true
                    },
                    {
                        type: 'textarea',
                        name: 'message',
                        placeholder: 'Ubutumwa',
                        pakuLemba: 'ukuCinja("message", event.target.value)'
                    }
                ],
                pakuTumina: `
                    event.preventDefault();
                    console.log({ izina, email, message });
                `
            }
        ]
    }
});
```

### Input Validation

```bemba
ifiputulwa: {
    ukusunga: {
        email: '',
        emailError: ''
    },
    inputs: [
        {
            type: 'email',
            pakuLemba: `
                ukuCinja('email', event.target.value);
                if (!event.target.value.includes('@')) {
                    ukuCinja('emailError', 'Email yakufwile kuba na @');
                } else {
                    ukuCinja('emailError', '');
                }
            `
        }
    ]
}
```

### Form with Validation

```bemba
forms: [
    {
        pakuTumina: `
            event.preventDefault();
            
            // Validate
            if (!izina) {
                return londolola('Lemba izina lyobe!');
            }
            
            if (!email.includes('@')) {
                return londolola('Email yakufwile kuba na @');
            }
            
            // Submit
            fetch('/api/contact', {
                method: 'POST',
                body: JSON.stringify({ izina, email, message })
            });
        `
    }
]
```

### Select Dropdowns

```bemba
selects: [
    {
        name: 'icalo',
        options: [
            { value: 'zm', label: 'Zambia' },
            { value: 'mw', label: 'Malawi' },
            { value: 'zw', label: 'Zimbabwe' }
        ],
        pakuCinja: 'ukuCinja("icalo", event.target.value)'
    }
]
```

### Checkboxes & Radio Buttons

```bemba
checkboxes: [
    {
        label: 'Ninasuma terms',
        pakuCinja: 'ukuCinja("agreed", event.target.checked)'
    }
],

radios: [
    {
        name: 'gender',
        options: ['Male', 'Female', 'Other'],
        pakuCinja: 'ukuCinja("gender", event.target.value)'
    }
]
```

</details>

<details>
<summary><strong>🌐 Data Fetching - APIs & Async</strong></summary>

### Fetch API Data

```bemba
fyambaIcipanda('UserList', {
    ifiputulwa: {
        ukusungaKabili: {
            users: [],
            loading: true,
            effect: `
                fetch('/api/users')
                    .then(res => res.json())
                    .then(data => {
                        ukuCinja('users', data);
                        ukuCinja('loading', false);
                    })
                    .catch(error => {
                        console.error(error);
                        ukuCinja('loading', false);
                    });
            `
        }
    }
});
```

### POST Data

```bemba
pakuKlikisha: `
    fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            izina: izina,
            email: email
        })
    })
    .then(res => res.json())
    .then(data => {
        londolola('User added!');
        ukuCinja('users', [...users, data]);
    });
`
```

### API Integration

```bemba
// Define API endpoint
pangaApi('users', {
    method: 'GET',
    handler: `
        const users = await database.getUsers();
        return {
            status: 200,
            data: users
        };
    `
});

// Use in component
ukusungaKabili: {
    users: [],
    effect: `
        fetch('/maapi/users')
            .then(res => res.json())
            .then(data => ukuCinja('users', data));
    `
}
```

### Loading States

```bemba
ifiputulwa: {
    ukusunga: {
        data: null,
        loading: true,
        error: null
    },
    ukusungaKabili: {
        effect: `
            ukuCinja('loading', true);
            fetch('/api/data')
                .then(res => res.json())
                .then(data => {
                    ukuCinja('data', data);
                    ukuCinja('loading', false);
                })
                .catch(err => {
                    ukuCinja('error', err.message);
                    ukuCinja('loading', false);
                });
        `
    }
}
```

</details>

<details>
<summary><strong>🔤 Built-in Functions - Utilities</strong></summary>

### Console Functions

```bemba
londolola(message)          // console.log()
londololaError(error)       // console.error()
londololaWarning(warning)   // console.warn()
```

### String Functions

```bemba
ukuPima(string)            // string.length
ukuPindula(string, old, new) // string.replace()
ukuGawanya(string, sep)    // string.split()
ukuSanganya(array, sep)    // array.join()
```

### Array Functions

```bemba
ukuOnjela(array, item)     // array.push()
ukuCotola(array, index)    // array.splice()
ukuPindula(array, fn)      // array.map()
ukuSankha(array, fn)       // array.filter()
```

### Math Functions

```bemba
ukuBalisha(a, b)           // a + b
ukuCepula(a, b)            // a - b
ukuCilisha(a, b)           // a * b
ukuGawanya(a, b)           // a / b
```

</details>

---

## 📚 **Documentation**

### **Project Structure**
```
my-app/
├── amapeji/           # Pages (like Next.js pages/)
│   └── index.bemba
├── ifikopo/           # Components (like Next.js components/)
│   ├── Button.bemba
│   └── Card.bemba
├── maapi/             # API routes (like Next.js api/)
│   ├── hello.bemba
│   └── users.bemba
├── maungu/            # Static files (like Next.js public/)
│   ├── favicon.ico
│   └── logo.png
├── bemba.config.js    # Configuration file
└── package.json
```

---

## 🌟 **Bun Support**

BembaJS is optimized for Bun with native performance:

```bash
# Install with Bun
bun install -g bembajs

# Create project with Bun
bun create bembajs my-app

# Run with Bun (faster!)
cd my-app
bun run dev
```

**Bun Features:**
- ⚡ **Native Transpiler** - Faster builds
- 🔥 **Hot Reload** - Instant updates
- 💾 **SQLite Caching** - Faster subsequent builds
- 📦 **Bundler** - Optimized production builds

---

## 🚀 **Deployment**

### **Vercel (Recommended)**
```bash
# Deploy to Vercel
npm install -g vercel
vercel
```

### **Other Platforms**
- **Netlify** - Static site hosting
- **Railway** - Full-stack deployment
- **Render** - Container deployment
- **AWS** - Cloud hosting

---

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

```bash
# Fork the repository
git clone https://github.com/YamikaniKL/bemba-compiler.git
cd bemba-compiler

# Install dependencies
pnpm install

# Build packages
pnpm build

# Run tests
pnpm test
```

**Contributing Areas:**
- 🐛 **Bug Fixes** - Report and fix issues
- ✨ **New Features** - Add functionality
- 📚 **Documentation** - Improve docs
- 🎨 **VS Code Extension** - Enhance IDE support
- 🌍 **Bemba Language** - Improve language features

---

## 📞 **Support & Community**

- 🌐 **Website**: [https://bembajs.dev](https://bembajs.dev)
- 📖 **Documentation**: [https://github.com/YamikaniKL/bemba-compiler](https://github.com/YamikaniKL/bemba-compiler)
- 🐛 **Issues**: [GitHub Issues](https://github.com/YamikaniKL/bemba-compiler/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/YamikaniKL/bemba-compiler/discussions)
- 📧 **Email**: [support@bembajs.dev](mailto:support@bembajs.dev)

---

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for the Zambian developer community** 🇿🇲

*Making programming accessible in African languages*

[![Star on GitHub](https://img.shields.io/github/stars/YamikaniKL/bemba-compiler?style=social)](https://github.com/YamikaniKL/bemba-compiler)
[![Follow on Twitter](https://img.shields.io/twitter/follow/bembajs?style=social)](https://twitter.com/bembajs)

</div>