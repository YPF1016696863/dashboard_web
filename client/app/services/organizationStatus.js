import { $http } from '@/services/ng';
import { appSettings } from '@/config/app-settings';

class OrganizationStatus {
  constructor() {
    this.objectCounters = {};
  }

  refresh() {
    return $http.get(appSettings.server.backendUrl + '/api/organization/status').then(({ data }) => {
      this.objectCounters = data.object_counters;
      return this;
    });
  }
}

export default new OrganizationStatus();
