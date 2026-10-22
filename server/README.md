# 学习小组同步服务

`eju_sync_server.py` — Python 3 标准库 + SQLite，无需安装任何依赖。

- 共同进度：刷题进度、错题本、待讲题单、17 天任务、模考记录，小组成员共用一份
- 数学白板：每人一层，互相实时可见（对方落笔时就能看到），只能修改自己那一层
- 跟随讲题：对方翻题、移动/缩放画布时，自己的讲题台跟着走
- 离线可用：断网时的修改存在浏览器里，恢复后自动上传

## 运行

```bash
python3 server/eju_sync_server.py            # 默认 127.0.0.1:8787，数据库 ./eju_sync.db
python3 -m unittest server/test_sync_server.py
```

环境变量：`EJU_SYNC_DB`、`EJU_SYNC_HOST`、`EJU_SYNC_PORT`、`EJU_SYNC_MAX_MEMBERS`（默认 4）、
`EJU_STATIC_DIR`（可选：同时托管网站静态文件，本地测试用）。

## 部署

1. systemd：参考 `eju-sync.service`
2. nginx：把 `nginx-eju-sync.conf` 里的 `location /api/v2/` 加进网站的 `server {}`（必须关闭 `proxy_buffering`，否则实时推送会卡住）
3. 备份：只需复制数据库文件（默认 `/var/lib/eju-sync/eju_sync.db`）

## 接口

见 `eju_sync_server.py` 顶部注释。鉴权使用 `Authorization: Bearer <成员令牌>`；服务器只保存令牌的 SHA-256。
