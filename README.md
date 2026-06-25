# Microsoft 版 CORTIS 预约系统

这个版本使用 Microsoft Azure 实现：

- 前台网页：Azure Static Web Apps
- 后台接口：Azure Functions
- 数据存储：Azure Table Storage
- 管理页面：`admin.html`

部署完成后，你会得到一个可以通过网址访问的公开项目。粉丝打开 `index.html` 预约，你打开 `admin.html` 查看预约者信息并安排时间。

## 文件说明

- `index.html`：粉丝预约页。
- `admin.html`：管理员查看页。
- `cortis-hero.png`：顶部背景图。
- `api/bookings`：提交预约、读取预约列表、读取已约满场次。
- `api/status`：管理员确认或取消预约。
- `staticwebapp.config.json`：Azure Static Web Apps 配置。
- `package.json`：Azure Functions 所需依赖。
- `server.js`：本地预览的简易静态服务。

## 如何部署到 Azure Static Web Apps

### 1. 准备 GitHub 仓库

1. 将本项目文件推送到 GitHub 仓库。
2. 确保仓库包含 `package.json`、`staticwebapp.config.json`、`api/` 目录和 `index.html`、`admin.html`。

### 2. 创建 Azure Storage Account

在 Azure 门户创建 Storage Account。创建完成后，打开 Storage Account，进入：

- `Access keys` -> `Connection string`

记录该连接字符串，用于后续部署配置。

### 3. 创建 Azure Static Web App

在 Azure 门户中创建 Static Web Apps：

- Build Presets：`Custom`
- App location：`/`
- Api location：`api`
- Output location：留空
- 选择 GitHub 仓库并授权

创建完成后，Azure 会自动生成一个 GitHub Actions workflow，也可使用本项目已创建的文件：

- `.github/workflows/azure-static-web-apps.yml`

### 4. 设置 Azure 环境变量（应用设置）

进入 Azure Static Web App 的 `Configuration` 或 `Workflow` 设置，添加以下环境变量：

```text
AZURE_STORAGE_CONNECTION_STRING=你的 Storage 连接字符串
ADMIN_TOKEN=你的管理员口令
BOOKINGS_TABLE_NAME=Bookings
```

`ADMIN_TOKEN` 是管理员登录 `admin.html` 时使用的口令，例如：`cortis2026`。

### 5. 配置 GitHub Secrets

在 GitHub 仓库的 `Settings > Secrets and variables > Actions` 中添加：

- `AZURE_STATIC_WEB_APPS_API_TOKEN`：Azure Static Web Apps 发布令牌

你可以在 Azure Static Web App 的部署中心找到该令牌。

### 6. 推送代码触发部署

将项目推送到 `main` 分支后，GitHub Actions 会自动触发部署。部署成功后，你会获得一个公共网址。

## 访问已部署网站

部署完成后，你会得到类似：

```text
https://<your-app>.azurestaticapps.net
```

用户页面：

```text
https://<your-app>.azurestaticapps.net/index.html
```

管理员页面：

```text
https://<your-app>.azurestaticapps.net/admin.html
```

## 让项目更容易被搜索引擎找到

1. 公开部署后，搜索引擎会抓取该网址。
2. 页面已添加基本 SEO 元数据，如 `description`、`robots` 和 Open Graph 标签。
3. 如果需要更可靠检索，可使用自定义域名：
   - 在 Azure Static Web Apps 中绑定自定义域
   - 在域名提供商处设置 CNAME 指向 Azure 地址

## 本地预览

如果你希望先在本地运行项目，可以直接使用本项目提供的本地服务器：

```powershell
npm install
npm run preview
```

然后打开浏览器访问：

```text
http://localhost:4280/index.html
http://localhost:4280/admin.html
```

如果 `npm install` 遇到本地原生模块构建失败，可以直接运行 `node server.js`。

## 项目功能

- 7/1 到 9/1 可预约
- 每天 09:00 到 18:00，每小时一场
- 每场仅限 1 人
- 预约后场次自动显示已约满
- 管理员可查看昵称、手机号、来源、日期、时间
- 管理员可确认或取消预约
- 取消后场次释放
- 管理页可导出 CSV
