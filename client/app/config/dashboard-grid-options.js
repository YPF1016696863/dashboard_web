const dashboardGridOptions = {
  columns: 6, // grid columns count 6 
  rowHeight: 25, // grid row height (incl. bottom padding) 50
  margins: 0, // widget margins 15
  mobileBreakPoint: 1000,// 800
  // defaults for widgets
  defaultSizeX: 3,
  defaultSizeY: 3,
  minSizeX: 1,
  maxSizeX: 6,
  minSizeY: 1,
  maxSizeY: 1000,
};

export default function init(ngModule) {
  ngModule.constant('dashboardGridOptions', dashboardGridOptions);
}

init.init = true;
