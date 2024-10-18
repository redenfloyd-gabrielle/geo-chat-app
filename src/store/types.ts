export enum WS_EVENT {
  // Tour Events
  TOUR_MoveToPoint = "TOUR:Move_to_Point",
  TOUR_PanelVideoPause = "TOUR:Panel_Video_Pause",
  TOUR_PanelVideoPlay = "TOUR:Panel_Video_Play",
  TOUR_PanelVideoMute = "TOUR:Panel_Video_Mute",
  TOUR_PanelVideoUnmute = "TOUR:Panel_Video_Unmute",
  TOUR_CameraAudioPause = "TOUR:Camera_Audio_Pause",
  TOUR_CameraAudioPlay = "TOUR:Camera_Audio_Play",
  TOUR_AutoplayChangeState = "TOUR:Autoplay_Change_State",
  TOUR_AutoplaySkipPoint = "TOUR:Autoplay_Skip_Point",
  TOUR_AutoplayJumpToPoint = "TOUR:Autoplay_Jump_Point",
  TOUR_SetShareExperienceSnapshot = "TOUR:Set_Share_Experience_Snapshot",

  // Application Events
  APP_MenuClick = "APP:Menu_Click",
  APP_ActionBarClick = "APP:Action_Bar_Click",
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
  user_uuid: string[],
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