export function getAuthToken() {
  return window.api.ipc('auth:get-auth-token', null).then(({ authToken }) => authToken);
}
