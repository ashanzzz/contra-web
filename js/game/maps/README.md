# 地图系统说明

本目录使用“数据驱动地图”结构，方便把关卡制作交给另一个 AI 独立完成。

## 一张地图需要提供什么

地图工厂函数返回一个对象，核心字段如下：

- `id`: 地图唯一 ID（建议 kebab-case）
- `name`: 地图名
- `briefing`: 开场简报
- `length`: 地图总长度（像素）
- `floorY`: 地面基准线
- `gravity`: 重力
- `spawnX` / `spawnY`: 玩家出生点
- `terrain`: 平台数组 `{x,y,width,height}`
- `props`: 场景装饰数组 `{type,x,y,width,height}`，`type` 支持 `crate` / `barrel`
- `waves`: 刷怪波次数组
  - `atX`: 玩家推进到该位置触发
  - `tip`: 波次提示文案
  - `spawns`: 敌人列表
    - `soldier`: `{type:"soldier",x,y,patrol:[left,right]}`
    - `turret`: `{type:"turret",x,y}`
    - `drone`: `{type:"drone",x,y}`
    - `boss`: `{type:"boss",x,y}`
- `finishX`: 任务结算点
- `completion`: 结算规则
  - `requireAllWaves`: 是否要求所有波次触发
  - `requireBossKill`: 是否要求击杀 Boss
  - `minProgressX`: 最小推进距离（防止开局误结算）

`schema.js` 会对数值进行兜底和清洗，避免非法数据直接炸运行时。

## 添加新地图步骤

1. 新建地图文件，例如 `js/game/maps/desert-strike.js`，导出 `createDesertStrikeMap()`。
2. 在 `js/game/maps/registry.js` 里引入并注册到 `mapFactories`。
3. 地图会自动出现在开场“地图选择”下拉框。

## 建议给另一个 AI 的分工

- 只改地图文件（`js/game/maps/*.js`）和必要素材；
- 不改引擎核心（`engine/game.js`）与实体逻辑（`entities/*.js`）；
- 先确保 `node --check js/main.js js/game/**/*.js` 通过，再提交。
