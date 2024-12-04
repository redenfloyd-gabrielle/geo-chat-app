export enum CHANNEL_TYPE {
  GROUP = "Group",
  DIRECT_MESSAGE = "Direct Message",
}

export enum LOGIN_STATUS {
  SUCCESS = "Success",
  USER_NOT_FOUND = "User not found",
  INVALID_PASSWORD = "Invalid user name or password",
}

export enum HTTP_RESPONSE_STATUS {
  SUCCESS = 'success',
  FAIL = 'fail'
}

export enum WS_EVENT {
  MESSAGE = 'message',
  COORDINATES = 'coordinates',
  FRIEND_REQUEST = 'friend request',
  DELETE_FRIEND_REQUEST = 'delete friend request',
  UPDATE_FRIENSHIP_STATUS = 'update friendship status'
}

export enum FRIENDSHIP_STATUS {
  Pending = "Pending",
  Accepted = "Accepted",
  Blocked = "Blocked"
}

export enum LOCATION_PERMISSION {
  GRANTED = 'granted',
  DENIED = 'denied',
}

export interface User {
  uuid: string,
  fullname: string,
  username: string,
  email: string,
  image_url?: string,
  password: string,
  created_on: number
}
export interface TokenResponse {
  uuid: string,
  username: string,
  email: string,
  iat: number,
  exp: number
}

export interface Channel {
  uuid: string,
  name: string,
  user_uuids: string[],
  users?: User[],
  type: CHANNEL_TYPE,
  created_on: string
}

export interface Message {
  uuid: string,
  channel_uuid: string,
  channel?: Channel,
  user_uuid: string,
  user?: User,
  message: string,
  created_on: number
}

export interface Location {
  uuid?: string,
  channel_uuid: string,
  user_uuid: string,
  latitude: number,
  longitude: number,
  weather?: string
  modified_on?: number
}

export interface Friend {
  uuid: string,
  user1_uuid: string  // UUID of the first user
  user2_uuid: string  // UUID of the second user
  created_on: number  // Timestamp when they became friends
  user1?: User,
  user2?: User,
  status?: string,
}

export interface Session {
  user: User,
  token: string
}

export interface Coordinates {
  uuid?: string
  channel_uuid?: string,
  user_uuid?: string,
  latitude: number,
  longitude: number
}

export interface _Marker {
  user_uuid?: string,
  channel_uuid?: string,
  marker?: L.Marker
  location?: string,
  weather?: string
}

export interface WebsocketMessage {
  event: WS_EVENT,
  data: any //Message | Coordinates | Friend
}

export interface Coords {
  latitude: number,
  longitude: number
}


export interface LocationRoute {
  user_uuid?: string,
  channel_uuid?: string,
  waypoint: L.LatLng[]
}