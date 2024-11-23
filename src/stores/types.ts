export enum CHANNEL_TYPE {
  GROUP = "Group",
  DIRECT_MESSAGE = "Direct Message",
}

export enum LOGIN_STATUS {
  SUCCESS = "Success",
  USER_NOT_FOUND = "User not found",
  INVALID_PASSWORD = "Invalid password",
}

export enum HTTP_RESPONSE_STATUS {
  SUCCESS = 'success',
  FAIL = 'fail'
}

export interface User {
  uuid: string,
  fullname: string,
  email: string,
  password: string,
  created_on: number
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
  user_uuid: string,
  message: string,
  created_on: number
}

export interface Location {
  uuid: string,
  channel_uuid: string,
  user_uuid: string,
  lattitude: string,
  longitude: string,
  weather?: string
  modified_on: number
}

export interface Friend {
  user1_uuid: string;  // UUID of the first user
  user2_uuid: string;  // UUID of the second user
  created_on: string;  // Timestamp when they became friends
}

export interface Session {
  user: User
}