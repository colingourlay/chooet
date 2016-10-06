const chooet = require('../../');
const html = require('../../html');
const docTitle = require('duet-document-title');
const docTitleChannel  = require('duet-document-title/channel');

chooet(choo => {

  app = choo();

  app.model({
    namespace: 'input',
    state: {
      title: 'my demo app'
    },
    reducers: {
      update: (data, state) => ({ title: data.payload })
    },
    effects: {
      updated: (data, state, send, done) => {
        docTitle(state.title, done);
      }
    }
  });

  const mainView = (state, prev, send) => html`
    <main class="app">
      <h1>${state.input.title}</h1>
      <label>Set the title</label>
      <input
        type="text"
        name="title"
        placeholder=${state.input.title}
        dataset=${{
          input: (event, value) => {
            send('input:update', { payload: value.title });
            send('input:updated');
          }
        }}>
    </main>
  `;

  app.router(route => [
    route('/', mainView)
  ]);

  app.start('body');

}, {
  channels: [docTitleChannel],
  logger: console.log.bind(console) // Log channel messages
});

