 

export interface Video {
  id: string
  coverImageSrc: string
}

export type VideoList = Video[]

// 数据库查询接口（便于未来替换）
interface VideoRepository {
  findAll(): Promise<Video[]>;
}

// 模拟数据库实现
class WxVideoRepository implements VideoRepository {
  async findAll(): Promise<Video[]> {
    return mockDb.map(item => new Video({
      id: item.id,
      title: item.title,
      url: item.url,
      duration: item.duration
    }));
  }
}

// 主服务类
export class VideoService {
  private repo: VideoRepository;

  constructor() {
    // 实际项目中这里会注入真实数据库连接
    this.repo = new WxVideoRepository();
  }

  // 对外暴露的方法：获取视频列表
  async getVideoList(): Promise<Video[]> {
    return this.repo.findAll();
  }
}