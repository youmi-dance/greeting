export interface Video {
  id: string
  coverImageSrc: string
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
}

export interface GenerateVideoResponse {
  request_id: string;
  output:{
    task_id: string;
    task_status: string;
  }
}
