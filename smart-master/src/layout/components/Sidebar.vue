import { 
  Tools,
  ChatDotRound,
  PictureFilled,
  DataAnalysis
} from '@element-plus/icons-vue';

const menuItems = [
  {
    title: '工具箱',
    icon: 'Tools',
    children: [
      {
        title: 'AI对话',
        icon: 'ChatDotRound',
        route: '/home/tools/ai-comparison'
      },
      {
        title: 'PPT生成',
        icon: 'PictureFilled',
        route: '/home/tools/ppt-generation'
      }
    ]
  },
  {
    title: '学情分析',
    icon: 'DataAnalysis',
    route: '/home/learning-analytics'
  }
]; 

export default menuItems;