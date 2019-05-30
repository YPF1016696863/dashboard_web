import { debounce, extend } from 'lodash';
import { $http } from '@/services/ng';
import appSettings from '@/config/app-settings';

let events = [];

const post = debounce(() => {
  const eventsToSend = events;
  events = [];

  $http.post(appSettings.server.backendUrl + '/api/events', eventsToSend);
}, 1000);

export default function recordEvent(action, objectType, objectId, additionalProperties) {
  const event = {
    action,
    object_type: objectType,
    object_id: objectId,
    timestamp: Date.now() / 1000.0,
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
  };
  extend(event, additionalProperties);
  events.push(event);

  post();
}
