# 学习小组同步服务

`eju_sync_server.py` — Python 3 标准库 + SQLite，无需安装任何依赖。

- 共同进度：刷题进度、错题本、待讲题单、17 天任务、模考记录，小组成员共用一份
- 数学白板：每人一层，互相实时可见（对方落笔时就能看到），只能修改自己那一层
- 跟随讲题：对方翻题、移动/缩放画布时，自己的讲题台跟着走
- 离线可用：断网时的修改存在浏览器里，恢复后自动上传
- 两种身份：学习的一方（进度、错题本是他的）/ 讲课的一方（看对方进度、带着讲课、布置和批改作业）
- 讲课模式：讲课的一方翻题、逐步展开解析、换白板页，对方实时跟随
- 作业：布置（题库真题或自出题）→ 作答 + 白板过程 / 拍照 → 提交 → 批改退回 → 订正；照片存在 `files/` 目录
- 机器人通知：作业布置 / 提交 / 批改时生成一句话通知，机器人用 `X-Bot-Token` 读 `/api/v2/notifications`

## 运行

```bash
python3 server/eju_sync_server.py            # 默认 127.0.0.1:8787，数据库 ./eju_sync.db
python3 -m unittest server/test_sync_server.py
```

环境变量：`EJU_SYNC_DB`、`EJU_SYNC_HOST`、`EJU_SYNC_PORT`、`EJU_SYNC_MAX_MEMBERS`（默认 4）、
`EJU_STATIC_DIR`（可选：同时托管网站静态文件，本地测试用）、
`EJU_SYNC_FILES`（作业照片目录，默认数据库旁边的 `files/`）、`EJU_BOT_TOKEN`（机器人读通知用的令牌，不设则关闭）。

## 部署

1. systemd：参考 `eju-sync.service`
2. nginx：把 `nginx-eju-sync.conf` 里的 `location /api/v2/` 加进网站的 `server {}`（必须关闭 `proxy_buffering`，否则实时推送会卡住）
3. 备份：数据库文件（默认 `/var/lib/eju-sync/eju_sync.db`）和照片目录 `/var/lib/eju-sync/files/`

## 接口

见 `eju_sync_server.py` 顶部注释。鉴权使用 `Authorization: Bearer <成员令牌>`；服务器只保存令牌的 SHA-256。
