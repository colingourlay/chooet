const assert = require('assert');
const barracks = require('barracks');
const duetLocation = require('duet-location');
const duetVirtualDOM = require('duet-virtual-dom');
const sheetRouter = require('sheet-router');

module.exports = choo;

// framework for creating sturdy web applications
// null -> fn
function choo (opts) {
  opts = opts || {};

  const _store = start._store = barracks();
  var _router = start._router = null;
  var _defaultRoute = null;
  var _update = null
  var _routes = null;
  var _frame = null;

  _store.use({ onStateChange: render });
  _store.use(opts);

  start.router = router;
  start.model = model;
  start.start = start;
  start.use = use;

  return start;

  // start the application
  // (str, obj?) -> null
  function start (selector, startOpts) {
    assert.equal(typeof selector, 'string', 'choo.start: selector should be an string');
    startOpts = startOpts || {};
    startOpts.vdom = startOpts.vdom || {};

    appInit(function (locationModel) {
      _store.model(locationModel);
      const createSend = _store.start(startOpts);
      _router = start._router = createRouter(_defaultRoute, _routes, createSend);
      const state = _store.state({state: {}});
      _update = duetVirtualDOM(selector, startOpts.vdom);
      _update(_router(state.location.pathname, state));
    }, startOpts);
  }

  // initial application state model
  // (fn, obj) -> null
  function appInit (cb, opts) {
    var _send;
    var _done;

    const subs = {
      getRefs: function (send, done) {
        _send = send;
        _done = done;
      }
    };

    const reducers = {
      setLocation: function setLocation (data, state) {
        return { pathname: data.location };
      }
    };

    duetLocation(function (pathname) {
      if (_send != null) {
        return _send('location:setLocation', { location: pathname }, _done);
      }

      cb({
        namespace: 'location',
        subscriptions: subs,
        reducers: reducers,
        state: {
          pathname: pathname
        }
      });

      _done(null);
    }, opts.hash === true);
  }

  // update the DOM after every state mutation
  // (obj, obj, obj, str, fn) -> null
  function render (data, state, prev, name, createSend) {
    _update(_router(state.location.pathname, state, prev));
  }

  // register all routes on the router
  // (str?, [fn|[fn]]) -> obj
  function router (defaultRoute, routes) {
    _defaultRoute = defaultRoute;
    _routes = routes;
  }

  // create a new model
  // (str?, obj) -> null
  function model (model) {
    _store.model(model);
  }

  // register a plugin
  // (obj) -> null
  function use (hooks) {
    assert.equal(typeof hooks, 'object', 'choo.use: hooks should be an object');
    _store.use(hooks);
  }

  // create a new router with a custom `createRoute()` function
  // (str?, obj, fn?) -> null
  function createRouter (defaultRoute, routes, createSend) {
    var prev = { params: {} };
    return sheetRouter(defaultRoute, routes, createRoute);

    function createRoute (routeFn) {
      return function (route, inline, child) {
        if (typeof inline === 'function') {
          inline = wrap(inline, route);
        }
        return routeFn(route, inline, child);
      };

      function wrap (child, route) {
        const send = createSend('view: ' + route, true);
        return function chooWrap (params, state) {
          const nwPrev = prev;
          const nwState = prev = Object.assign({}, state, { params: params });
          if (opts.freeze !== false) {
            Object.freeze(nwState);
          }
          return child(nwState, nwPrev, send);
        };
      }
    }
  }
}
