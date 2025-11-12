// 存储服务 - 用于在本地保存生成的内容

// 初始化本地存储
export const initStorage = () => {
  console.log('初始化本地存储...');
  
  if (!localStorage.getItem('homeworks')) {
    console.log('创建作业存储空间');
    localStorage.setItem('homeworks', JSON.stringify([]));
  } else {
    const homeworks = JSON.parse(localStorage.getItem('homeworks'));
    console.log(`作业存储空间已存在，包含 ${homeworks.length} 条作业数据`);
  }
  
  if (!localStorage.getItem('lessonPlans')) {
    console.log('创建教案存储空间');
    localStorage.setItem('lessonPlans', JSON.stringify([]));
  } else {
    const lessonPlans = JSON.parse(localStorage.getItem('lessonPlans'));
    console.log(`教案存储空间已存在，包含 ${lessonPlans.length} 条教案数据`);
  }
};

// 保存作业内容
export const saveHomework = (title, content) => {
  try {
    console.log(`开始保存作业: "${title}"`);
    
    // 确保homeworks存在
    if (!localStorage.getItem('homeworks')) {
      console.log('创建作业存储空间');
      localStorage.setItem('homeworks', JSON.stringify([]));
    }
    
    const homeworks = getHomeworks();
    const id = Date.now().toString();
    
    console.log(`生成作业ID: ${id}`);
    
    const newHomework = {
      id,
      title,
      content,
      createTime: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    homeworks.push(newHomework);
    localStorage.setItem('homeworks', JSON.stringify(homeworks));
    
    // 验证保存是否成功
    const savedHomeworks = JSON.parse(localStorage.getItem('homeworks') || '[]');
    const saved = savedHomeworks.some(h => h.id === id);
    
    if (saved) {
      console.log(`作业保存成功，当前共有 ${savedHomeworks.length} 条作业`);
    } else {
      console.error('作业保存验证失败');
    }
    
    return id;
  } catch (error) {
    console.error('Error saving homework:', error);
    throw new Error('保存作业失败: ' + error.message);
  }
};

// 获取所有作业
export const getHomeworks = () => {
  try {
    const homeworks = localStorage.getItem('homeworks');
    return homeworks ? JSON.parse(homeworks) : [];
  } catch (error) {
    console.error('Error getting homeworks:', error);
    return [];
  }
};

// 获取单个作业
export const getHomework = (id) => {
  try {
    const homeworks = getHomeworks();
    return homeworks.find(h => h.id === id);
  } catch (error) {
    console.error('Error getting homework:', error);
    return null;
  }
};

// 更新作业
export const updateHomework = (id, updates) => {
  try {
    const homeworks = getHomeworks();
    const index = homeworks.findIndex(h => h.id === id);
    
    if (index === -1) {
      throw new Error('作业不存在');
    }
    
    homeworks[index] = {
      ...homeworks[index],
      ...updates,
      lastModified: new Date().toISOString()
    };
    
    localStorage.setItem('homeworks', JSON.stringify(homeworks));
    return homeworks[index];
  } catch (error) {
    console.error('Error updating homework:', error);
    throw new Error('更新作业失败');
  }
};

// 删除作业
export const deleteHomework = (id) => {
  try {
    let homeworks = getHomeworks();
    homeworks = homeworks.filter(h => h.id !== id);
    localStorage.setItem('homeworks', JSON.stringify(homeworks));
  } catch (error) {
    console.error('Error deleting homework:', error);
    throw new Error('删除作业失败');
  }
};

// 保存教案内容
export const saveLessonPlan = (title, content) => {
  try {
    const lessonPlans = getLessonPlans();
    const id = Date.now().toString();
    const newLessonPlan = {
      id,
      title,
      content,
      createTime: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    lessonPlans.push(newLessonPlan);
    localStorage.setItem('lessonPlans', JSON.stringify(lessonPlans));
    return id;
  } catch (error) {
    console.error('Error saving lesson plan:', error);
    throw new Error('保存教案失败');
  }
};

// 获取所有教案
export const getLessonPlans = () => {
  try {
    const lessonPlans = localStorage.getItem('lessonPlans');
    return lessonPlans ? JSON.parse(lessonPlans) : [];
  } catch (error) {
    console.error('Error getting lesson plans:', error);
    return [];
  }
};

// 获取单个教案
export const getLessonPlan = (id) => {
  try {
    const lessonPlans = getLessonPlans();
    return lessonPlans.find(lp => lp.id === id);
  } catch (error) {
    console.error('Error getting lesson plan:', error);
    return null;
  }
};

// 更新教案
export const updateLessonPlan = (id, updates) => {
  try {
    const lessonPlans = getLessonPlans();
    const index = lessonPlans.findIndex(lp => lp.id === id);
    
    if (index === -1) {
      throw new Error('教案不存在');
    }
    
    lessonPlans[index] = {
      ...lessonPlans[index],
      ...updates,
      lastModified: new Date().toISOString()
    };
    
    localStorage.setItem('lessonPlans', JSON.stringify(lessonPlans));
    return lessonPlans[index];
  } catch (error) {
    console.error('Error updating lesson plan:', error);
    throw new Error('更新教案失败');
  }
};

// 删除教案
export const deleteLessonPlan = (id) => {
  try {
    let lessonPlans = getLessonPlans();
    lessonPlans = lessonPlans.filter(lp => lp.id !== id);
    localStorage.setItem('lessonPlans', JSON.stringify(lessonPlans));
  } catch (error) {
    console.error('Error deleting lesson plan:', error);
    throw new Error('删除教案失败');
  }
}; 