import EmberRouter from '@ember/routing/router';
import config from 'my-app/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('a');
  this.route('b');
  this.route('c', function() {
    this.route('sub-c', { path: ':id' }, function () {
    	this.route('sub-sub-c', { path: ':dynamic-param' });
    });
  });
});
