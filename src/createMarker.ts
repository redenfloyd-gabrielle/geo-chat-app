import L from 'leaflet';

declare module "leaflet" {
    namespace Routing {
      interface RoutingControlOptions extends ItineraryOptions {
        createMarker?: (waypointIndex: number, waypoint: Waypoint, numberOfWaypoints: number) => L.Marker | boolean | undefined;
        draggableWaypoints?: boolean | undefined;
      }
    }
  }