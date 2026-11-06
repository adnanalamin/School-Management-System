import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { ErrorState } from './ErrorState';

/** Router-level errorElement: loader/lazy failures and render errors inside a route. */
export function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <ErrorState
        fullPage
        title="Page not found"
        message="The page you are looking for does not exist or has moved."
      />
    );
  }

  console.error('Route error', error);

  return (
    <ErrorState
      fullPage
      title="This page failed to load"
      message="Check your connection and reload. If it keeps happening, contact your administrator."
      retryLabel="Reload page"
      onRetry={() => window.location.reload()}
    />
  );
}
