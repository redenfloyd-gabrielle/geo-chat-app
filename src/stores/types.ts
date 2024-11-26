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
  COORDINATES = 'coordinates'
}

export interface User {
  uuid: string,
  fullname: string,
  username: string,
  email: string,
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
  user2?: User
}

export interface Session {
  user: User,
  token: string
}

export interface Coordinates {
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
  data: Message | Coordinates
}