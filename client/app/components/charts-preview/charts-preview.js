import template from './charts-preview.html';

// eslint-disable-next-line import/prefer-default-export
export const ChartsPreview = {
  template,
  bindings: {
    visualization: '<',
    queryResult: '<'
  },
  controller() {
    'ngInject';

  }
};

export default function init(ngModule) {
  ngModule.component('chartsPreview', ChartsPreview);
}

init.init = true;
