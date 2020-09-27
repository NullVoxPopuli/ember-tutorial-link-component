import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { assert } from '@ember/debug';
import { DEBUG } from '@glimmer/env';

export default class extends Component {
  @service router;
  
  /**
   * Validate the href
   * 
   * This component accepts:
   * - absolute URL (with explicit or relative protocol)
   * - relative URL with leading /
   *
   * NOTE: the assert is removed in production, so there is no
   *       customer-impact to providing dev-time assisstance.
   * NOTE: DEBUG blocks are removed in production as well
   */
  get href() {
    let { href } = this.args;
 
    if (DEBUG) {
      assert(`@href is required`, href);
      
      let hasProtocol = href.includes('://');
      let isProtocolRelative = href.startsWith('//');
      let isAbsoluteUrl = href[0] === '/' && href[1] !== '/';
      
      assert(
        `provided @href argument must begin with a protocol, ` +
        `such as "https://", or begin with a "/".`,
        hasProtocol || isProtocolRelative || isAbsoluteUrl
      );
    }
      
    return href;
  }
  
  /**
   * If the href needs to navigate us to a different domain,
   * it will need to specify so.
   * Additionally, we'd fallback to regular anchor tag behovior.
   */
  get isSameDomain() {
    return !this.href.includes('//');
  }
    
  get hrefInfo() {    
    if (this.isSameDomain) {
      return this.router.recognize(this.href);  
    }
  }
    
	get isActive() {
    // TODO: Remove when ember-twiddle supports to ember 3.22
    this.router.currentURL;
    // ---------------------
    if (!this.isSameDomain) {
      return false;
    }
    
    let routeInfo = this.hrefInfo;
    
    let dynamicSegments = getParams(routeInfo);
    
    return this.router.isActive(
      routeInfo.name, 
      ...dynamicSegments,
      { queryParams: routeInfo.queryParams }
    );
  }
  
  @action
  navigate(clickEvent) {
    // if the href isn't in our app, 
    // don't prevent the default behavior
    console.log(this.isSameDomain);
    if (!this.isSameDomain) {
      return true;
    }
    
    // in-app navigations should not cause the page to reload
    clickEvent.preventDefault();
    
    this.router.transitionTo(this.href);
  }
}

function getParams(currentRouteInfo) {
  let params = [];

  while (currentRouteInfo.parent) {
    params = [currentRouteInfo.params, ...params];
    currentRouteInfo = currentRouteInfo.parent;
  }

  return params.map(Object.values).flat();
}
