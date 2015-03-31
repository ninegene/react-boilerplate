require('bootstrap');
var React = require("react");
var Router = require('react-router');
var {
  Route,
  DefaultRoute,
  NotFoundRoute,
  Redirect,
  RouteHandler,
  Link
} = Router;

// These components need to be moved to individual jsx file inside components directory

var App = React.createClass({

  mixins: [Router.State],

  render: function () {
    var path = this.getPath();  // mixins Router.State.getPath()

    return (
      <div className="App">
        <nav className="navbar navbar-inverse navbar-fixed-top">
          <div className="container">
            <div className="navbar-header">
              <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <a className="navbar-brand" href="/">React Boilerplate</a>
            </div>
            <div id="navbar" className="collapse navbar-collapse">
              <ul className="nav navbar-nav">
                <li className={path == '/' ? 'active' : ''}><Link to="/">Home</Link></li>
                <li className={path == '/about' ? 'active' : ''}><Link to="/about">About</Link></li>
                <li className={path == '/company' ? 'active' : ''}><Link to="/company">Company (redirect to About)</Link></li>
                <li className={/^\/user/.test(path) ? 'active' : ''}><Link to="/users/recent">User</Link></li>
                <li className={path == '/nothing-here' ? 'active' : ''}><Link to="/nothing-here">Invalid Link</Link></li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="Page">
          <RouteHandler />
        </div>
      </div>
    );
  }
});

var Home = React.createClass({
  render: function () {
    return (
      <div className="container">
        <h1>Home</h1>
        <p></p>
      </div>
    );
  }
});

var About = React.createClass({
  render: function () {
    return (
      <div className='container'>
        <h1>About</h1>
      </div>
    );
  }
});

var Users = React.createClass({
  render: function () {
    return (
      <div className="Page">
        <RouteHandler />
      </div>
    );
  }
});

var RecentUsers = React.createClass({
  render: function () {
    return (
      <div className='container'>
        <h1>RecentUsers</h1>
        <ul>
          <li><Link to="/user/one">User One</Link></li>
          <li><Link to="/user/two">User Two</Link></li>
          <li><Link to="/user/invalid">Invalid User</Link></li>
          <li><Link to="/users/usertypo">Invalid User Link (/users/usertypo)</Link></li>
        </ul>
      </div>
    );
  }
});

var User = React.createClass({

  mixins: [Router.State, Router.Navigation],

  handleBackClick: function () {
    this.goBack(); // mixins Router.Navigation.goBack();
  },

  render: function () {
    var params = this.getParams();
    var userId = params.userId;
    console.log('params', params);
    var lookup = {
      one: "One",
      two: "Two"
    };
    var userName = lookup[userId];
    if (!userName) {
      this.transitionTo('user-not-found'); // mixins Router.State.transitionTo()
    }
    return (
      <div className='container'>
        <h1>User {userName}</h1>
        <a onClick={this.handleBackClick}>Back</a>
      </div>
    );
  }
});

var UserNotFound = React.createClass({
  render: function () {
    return (
      <div className='container'>
        <h1>UserNotFound</h1>
      </div>
    );
  }
});

var UserRouteNotFound = React.createClass({
  render: function () {
    return (
      <div className='container'>
        <h1>UserRouteNotFound</h1>
      </div>
    );
  }
});

var NotFound = React.createClass({
  render: function () {
    return (
      <div className='container'>
        <h1>NotFound</h1>
      </div>
    );
  }
});

var routes = (
  <Route handler={App} path="/">
    <DefaultRoute handler={Home} />
    <Route name="about" handler={About} />
    <Route name="users" handler={Users}>
      <Route name="recent-users" path="recent" handler={RecentUsers} />
      <Route name="user" path="/user/:userId" handler={User} />
      <Route name="user-not-found" handler={UserNotFound} />
      <NotFoundRoute handler={UserRouteNotFound}/>
    </Route>
    <NotFoundRoute handler={NotFound}/>
    <Redirect from="company" to="about" />
  </Route>
);

Router.run(routes, Router.HashLocation, function (Handler) {
  //console.log('Router.run', arguments);
  React.render(<Handler />, document.getElementById('app'));
});
