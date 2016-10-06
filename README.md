# chooet

All the goodness of [choo](https://github.com/yoshuawuyts/choo), multi-threaded by [duet](https://github.com/colingourlay/duet).

```js
const chooet = require('chooet');
const html = require('chooet/html');

chooet(choo => {
  app = choo();

  app.model({
    state: { title: 'Not quite set yet' },
    reducers: {
      update: (data, state) => ({ title: data })
    }
  });

  const mainView = (state, prev, send) => html`
    <main>
      <h1>Title: ${state.title}</h1>
      <input
        type="text"
        name="title"
        dataset=${{input: (event, value) => send('update', value.title)}}>
    </main>
  `;

  app.router(route => [
    route('/', mainView)
  ]);

  app.start('body');
});
```
