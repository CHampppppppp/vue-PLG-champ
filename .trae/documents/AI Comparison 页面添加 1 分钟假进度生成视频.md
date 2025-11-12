## 目标与位置
- 目标：在 ai-comparison 页面将“生成视频”改为约 1 分钟的假进度条，结束后显示输出成功。
- 位置：`src/views/tools/aiComparison/index.vue`（路由：`src/router/index.js:28-31`）。现有步骤与进度 UI 已可用（`src/views/tools/aiComparison/index.vue:59-66`）。

## 实现方案
- 假进度控制器：为当前消息的“生成教学视频”步骤增加专用进度控制数据（`durationMs=60000`、`tickMs=500`、`timerId`、`progress`）。
- 触发时机：在 `sendMessage` 流程内，进入“生成教学视频”步骤时启动计时器（参考 `src/views/tools/aiComparison/index.vue:964-1192`，尤其步骤声明 `1027` 以及进入视频生成的处理 `1136-1167`）。
- 计时逻辑：每 `tickMs` 更新 `progress = min(100, elapsed/durationMs*100)`；到达 100 清理计时器，设置步骤完成（`step.progress=100`）、更新处理文案为空，并追加“输出成功”的结果反馈（沿用现有消息结构：`src/views/tools/aiComparison/index.vue:1165-1167`）。
- UI 绑定：沿用现有 `el-progress`（`src/views/tools/aiComparison/index.vue:59-66`），保持 `:status="step.progress >= 100 ? 'success' : ''"`，无需改动样式框架。
- 禁用真实阻塞：不调用任何真实视频生成 API，只做 UI 进度模拟；保留其他资源生成（如教案/课件）原逻辑。
- 清理与容错：重复触发前清除旧 `timerId`；在组件卸载时清理计时器，避免内存泄漏或多重计时。

## 影响范围
- 仅修改 `aiComparison` 页面逻辑，不改动路由、API 文件与资源管理页面。
- 不改变其他步骤与动作按钮逻辑（如保存到“资料”或查看课件脚本）。

## 验证与表现
- 手动验证：点击发送后进度在约 60 秒内线性增长，完成后进度条显示成功状态，消息区域出现“输出成功/生成视频已保存至资料”的提示。
- 行为检查：页面不会卡住超过 1 分钟；滚动与其他交互正常；再次触发能重置并重新计时。

## 可选增强（后续可选）
- 可配置时长：通过常量或设置面板调整 `durationMs`（如 30–90 秒）。
- 取消按钮：在进度进行中提供“取消生成”以立即清理计时器并回退状态。
- 成功动作：在“输出成功”后提供跳转“资料”页的快捷按钮（复用现有资源页：`src/views/resources/index.vue:4-9,47,104`）。