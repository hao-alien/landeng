# Lantern Desktop UI

##

- Using [**react-transform-hmr**](https://github.com/gaearon/react-transform-hmr), the changes in the CSS and JS get reflected in the app instantly without refreshing the page.

- [**Redux**](https://github.com/rackt/redux) is a much better implementation of a flux–like, unidirectional data flow. Redux makes actions composable, reduces the boilerplate code and makes hot–reloading possible in the first place.

- [**Babel**](http://babeljs.io/) is a modular JavaScript transpiler that helps to use next generation JavaScript and JSX.

- [**PostCSS**](https://github.com/postcss/postcss) for modular CSS.

- [**react-router**](https://github.com/rackt/react-router) is used for routing..

- [**ServiceWorker**](http://www.html5rocks.com/en/tutorials/service-worker/introduction/) and [**AppCache**](http://www.html5rocks.com/en/tutorials/appcache/beginner/) make it possible to use the application offline. As soon as the website has been opened once, it is cached and available without a network connection.

## Install

1. Run `npm install` to install the dependencies.

2. Run `npm start` to start the local web server.

3. Go to `http://localhost:2000` and you should see the site running!

## Building & Deploying

1. Run `npm run build`, which will compile all the necessary files in a `build` folder.

### Server Configuration

#### Apache

Includes `.htaccess` file that does two things:

1. Redirect all traffic to HTTPS because ServiceWorker only works for encrypted traffic

2. Rewrite all pages to the `index.html` to let `react-router` take care of presenting the correct page

## CSS

The CSS modules found in the `css` subfolders all get imported into one big file (`main.css`), which gets transpiled with PostCSS.

See the [`css` folder README](css/README.md) for more information about the PostCSS plugins used and the CSS structure.

## JS

All files that are `import`ed/`require`d somewhere get compiled into one big file at build time. (`build/bundle.js`) Webpack automatically optimizes your JavaScript with `UglifyJS`, so you don't have to worry about that.

See the [`js` folder README](js/README.md) for more information about the JS structure.
