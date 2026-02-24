# Operation Iron Delta (Contra-style Web Game)

一个原生 HTML/CSS/JavaScript + Canvas 的横版动作射击网页游戏，使用项目内自制 SVG 素材，无外部 CDN 依赖。

## 运行方式

### 方式 1（推荐，本地静态服务）
在项目目录执行：

```bash
python3 -m http.server 8080
```

然后访问 `http://localhost:8080`。

### 方式 2（Node.js 静态服务）
如果你的环境没有 Python，可用：

```bash
npx serve . -l 8080
```

然后访问 `http://localhost:8080`。

> 不建议 `file://` 直接双击打开 `index.html`，部分浏览器会限制 ES Module / 资源加载。

## 操作说明

### 桌面端
- 移动：`A / D` 或 `← / →`
- 下蹲：`S` 或 `↓`
- 跳跃：`K` / `Space` / `W` / `↑`
- 射击（可连发）：`J`
- 暂停 / 继续：`P` 或 `ESC`
- 音效开关：`M`

### 移动端
- 左下区域：左右移动、下蹲、跳跃
- 右下区域：开火、跳跃、暂停

## 已实现内容（正式版）

- 开始界面（地图选择 + 难度选择）、战斗教学提示、胜利/失败结算、重开流程
- 难度系统：新兵 / 标准 / 老兵（三档）
- 地图系统（可扩展）：当前内置 1 张地图（铁幕突击 / Iron Delta），可继续注册新地图
- 核心动作：移动 / 跳跃 / 蹲下 / 射击（含射速节奏控制）
- 敌人类型：地面兵、炮台、飞行单位、Mini Boss
- 系统机制：子弹碰撞、敌我受伤、无敌帧、HP/Lives、分数、关卡进度条、结算条件防开局误触
- 强化反馈：命中/击破粒子、枪口火焰、爆裂特效、实时音效（WebAudio）
- 场景细节：前后景分层 + 云层视差 + 可视化场景道具（箱体/油桶）
- 战斗功能：随时暂停、状态提示、结算统计（耗时/命中率/击杀）
- 成绩系统：最高分本地持久化（localStorage）
- 体验支持：桌面键盘 + 移动触控按钮，自适配手机宽度

## 素材说明

`assets/` 下所有 SVG 为本项目自制（可替换）。
- `player.svg`
- `enemy_soldier.svg`
- `enemy_turret.svg`
- `enemy_drone.svg`
- `enemy_boss.svg`
- `tile_ground.svg`
- `bg_far.svg`
- `bg_near.svg`
- `bg_clouds.svg`
- `prop_crate.svg`
- `prop_barrel.svg`
- `effect_burst.svg`
- `effect_muzzle.svg`
- `player_ally.svg`（扩展备用）
- `enemy_sniper.svg`（扩展备用）
- `enemy_mech.svg`（扩展备用）

未使用魂斗罗原版素材，避免版权风险。

## 项目结构

```text
contra-web/
  index.html
  styles.css
  assets/
  js/
    main.js
    game/
      constants.js
      assets.js
      audio/sfx.js
      engine/game.js
      entities/player.js
      entities/enemies.js
      entities/projectile.js
      maps/registry.js
      maps/schema.js
      maps/iron-delta.js
      maps/README.md
      level/level1.js  # 兼容层（映射到 maps）
      input/keyboard.js
      input/touch.js
      ui/hud.js
```

## 可继续扩展

- 继续新增地图文件并在 `js/game/maps/registry.js` 注册（支持把地图制作拆给其他 AI）
- 增加手柄支持与可配置键位
- 接入关卡编辑器或存档点系统
