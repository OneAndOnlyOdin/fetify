# fetify

> a virtual lock card game

## Requirements

- Node.JS 12.x
- Yarn: package manager (`npm install yarn -g`)
- Docker or MongoDB

## Setup

```sh
# Install dependencies
> yarn

# Setup a MongoDB docker container:
# Alternatively, create a .env file with a DB_URI environment variable with your MongoDB connection string
> yarn db:recreate

# Build the project
> yarn build

# Start the API
> yarn start

# Serve the front-end
> yarn serve
```

## Development

I highly recommend using Visual Studio Code with the Prettier extension.

With VSCode:

### Compiling the project

Use the `CMD + Shift + B` (OSX) or `Ctrl + Shift + B` (Win) shortcut to run the Default Build Task which will compile the project in watch mode.

### Debugging the project

Use the `F5` shortcut to run the Launch task to run and debug the project

## Contributing

Please ensure pull requests are formatted with Prettier and are written in TypeScript following the conventions used in the project.
