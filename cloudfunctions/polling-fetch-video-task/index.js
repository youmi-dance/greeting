const cloud = require('wx-server-sdk');
const dayjs = require('dayjs');
const axios = require('axios');

// 初始化 cloud
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const API_AUTH_KEY = 'sk-b9e99c3d10504180bea3ef1edc4989af';

const db = cloud.database();
const userTaskCollection = db.collection('user_task');

exports.main = async (event, context) => {
  try {
    /**
     * 1. 查询所有待处理的任务
     */
    const { data: taskList } = await userTaskCollection
      .where({
        task_status: 'PENDING'
      })
      .get();

    if (taskList.length === 0) {
      return { message: 'no pending tasks' };
    }


    /**
     * 2. 遍历任务并发送请求
     */
    const results = [];
    for (const task of taskList) {
      const taskId = task.task_id;

      try {
        const {
          status,
          statusText,
          data: taskInfo,
        } = await axios.get(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${API_AUTH_KEY}`
          },
          method: 'GET',
        });

        if (status !== 200) {
          return {
            success: false,
            message: 'Call aliyun Modal error',
            statusText,
          };
        }

        // console.log('~~~~~~~ res', taskInfo);

        /**
         * 3. 根据返回结果更新数据库中的状态
         */
        const {
          output: {
            task_status,
            message,
            video_url,
          },
        } = taskInfo;
        let updateData = {};
        if (task_status === 'SUCCEEDED') {
          updateData = {
            task_status,
            video_url,
          };
        } else if (task_status === 'FAILED') {
          updateData = {
            task_status,
            error_msg: message,
          };
        }

        await userTaskCollection.doc(task._id).update({
          data: {
            ...updateData,
            last_check_time: dayjs().format('YYYY-MM-DD HH:mm:ss')
          }
        });

        results.push({
          taskId,
          status: 'SUCCEEDED',
          taskStatus: task_status,
        });
      } catch (err) {
        console.error(`请求任务 ${taskId} 失败:`, err.message);
        results.push({
          taskId,
          status: 'FAILED',
          error: err.message,
        });
      }
    }

    return {
      success: true,
      processedCount: results.length,
      results
    };
  } catch (err) {
    console.error('云函数执行异常:', err);
    return {
      success: false,
      error: err.message,
    };
  }
};

