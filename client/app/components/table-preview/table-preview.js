import template from './table-preview.html';

// eslint-disable-next-line import/prefer-default-export
export const TablePreview = {
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
  ngModule.component('tablePreview', TablePreview);
}

init.init = true;
