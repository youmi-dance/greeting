export interface Video {
  _id: string
  _openid: string
  error_msg: string
  gmt_create: string
  image_file_id: string
  last_check_time: string
  request_id: string
  task_id: string
  task_status: string
  text: string
  video_url?: string
}

export type VideoList = Video[]

export interface GenerateAudioResponse {
  output: {
    audio: {
      data: string;
      expires_at: number;
      id: string;
      url: string;
    },
    finish_reason: string
  },
  usage: {
    characters: number
  },
  request_id: string
  errMsg: string
}

export interface GenerateVideoResponse {
  request_id: string;
  output:{
    task_id: string;
    task_status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  }
}
