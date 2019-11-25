/**
 * Angular2react needs an $injector, but it doesn't actually invoke $injector.get
 * until we invoke ReactDOM.render. We can take advantage of this to provide the
 * "lazy" injector below to React components created with angular2react, as a way
 * to avoid component ordering issues.
 *
 */

// state
let $injector;

// eslint-disable-next-line import/prefer-default-export
export const lazyInjector = {
    get $injector () {
        return {
            get get () {
                return $injector.get;
            }
        }
    },
    set $injector (_$injector) {
        $injector = _$injector;
    }
};