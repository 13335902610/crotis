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

## 如何部署到 Vercel（推荐，无需 Azure 账号）

### 1. 准备 GitHub 仓库

1. 将本项目文件推送到 GitHub 仓库。
2. 确保仓库包含 `package.json`、`vercel.json`、`api/` 目录和 `index.html`、`admin.html`。

### 2. 创建 Vercel 项目

1. 登录 `https://vercel.com`
2. 点击 `New Project`
3. 连接你的 GitHub 账户
4. 选择仓库 `crotis`
5. 选择 `Import`
6. 在项目设置中保持默认配置，点击 `Deploy`

Vercel 会自动识别 `api/` 目录，并部署你的后端接口。

### 3. 设置 Vercel 环境变量

在 Vercel 仪表盘中打开项目设置：

- `AZURE_STORAGE_CONNECTION_STRING` = 你的 Storage 连接字符串
- `ADMIN_TOKEN` = 你的管理员口令
- `BOOKINGS_TABLE_NAME` = `Bookings`

这三个配置是后端接口正常运行所必须的。

### 4. 部署完成后访问

部署成功后，Vercel 会给你一个应用域名，例如：

```text
https://<your-vercel-app>.vercel.app
```

访问前端页面：

```text
https://<your-vercel-app>.vercel.app/index.html
https://<your-vercel-app>.vercel.app/admin.html
```

### 5. 如果你还想使用 Azure

如果你未来获得 Azure 账号，也可以回头使用 `staticwebapp.config.json` 和 Azure Static Web Apps 部署。

### 6. 本地调试

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

## GitHub Pages 静态演示

如果你只需要一个可访问的静态演示页面（无后端接口），可以使用 GitHub Pages：

1. 上传代码到 GitHub 仓库
2. 打开仓库页面，进入 `Settings`
3. 左侧选择 `Pages`
4. 在 `Source` 选择 `Deploy from a branch`
5. 选择 Branch: `main`，Folder: `/ (root)`
6. 点击 `Save`

几分钟后，你会得到类似：

```text
https://<你的用户名>.github.io/crotis/index.html
```

此时页面会自动进入本地演示模式，不再尝试连接后端接口。注意：该模式仅用于演示，预约数据会保存在浏览器本地存储，后端 `api/` 接口不可用。

## 项目功能

- 7/1 到 9/1 可预约
- 每天 09:00 到 18:00，每小时一场
- 每场仅限 1 人
- 预约后场次自动显示已约满
- 管理员可查看昵称、手机号、来源、日期、时间
- 管理员可确认或取消预约
- 取消后场次释放
- 管理页可导出 CSV
