import axios from 'axios';
import CryptoJS from 'crypto-js';

// 从环境变量获取配置信息
const APP_ID = import.meta.env.VITE_XUNFEI_APP_ID;
const API_SECRET = import.meta.env.VITE_XUNFEI_API_SECRET;
const BASE_URL = '/api/xunfei/api/ppt/v2/create';  // 更新为正确的API路径

// 获取签名
const getSignature = (timestamp) => {
  const signatureOrigin = APP_ID + timestamp;
  const signatureSha = CryptoJS.HmacSHA1(signatureOrigin, API_SECRET);
  return CryptoJS.enc.Base64.stringify(signatureSha);
};

// 生成PPT内容
export const generatePPT = async (theme) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = getSignature(timestamp);

    // 创建FormData对象
    const formData = new FormData();
    formData.append('query', theme);
    formData.append('language', 'cn');
    formData.append('isCardNote', 'true');
    formData.append('search', 'true');
    formData.append('isFigure', 'true');
    formData.append('aiImage', 'advanced');
    formData.append('author', '智文');

    const response = await axios.post(BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'appId': APP_ID,
        'timestamp': timestamp.toString(),
        'signature': signature
      }
    });

    if (!response.data) {
      throw new Error('API返回数据为空');
    }

    if (response.data.code !== 0) {
      throw new Error(response.data.desc || '生成PPT失败');
    }

    return response.data.data;
  } catch (error) {
    console.error('生成PPT内容失败:', error);
    if (error.response) {
      console.error('错误响应:', error.response.data);
      throw new Error(error.response.data.desc || '服务器返回错误');
    } else if (error.request) {
      console.error('请求错误:', error.request);
      throw new Error('网络请求失败，请检查网络连接');
    } else {
      throw new Error(error.message || '生成PPT失败');
    }
  }
}; 