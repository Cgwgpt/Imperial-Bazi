# API密钥安全修复需求文档

## 介绍

Imperial Bazi Pro 项目当前存在严重的安全漏洞：Google Gemini API密钥被暴露在版本控制系统中。本需求文档定义了修复此安全问题的完整需求，包括密钥管理、环境隔离和防止意外泄露的措施。

## 术语表

- **API密钥**: Google Gemini API的认证凭证，用于调用生成式AI服务
- **环境变量**: 在运行时注入应用程序的配置值，不存储在代码中
- **前端应用**: React应用程序，运行在用户浏览器中
- **后端代理**: 服务器端API，代理前端对Gemini API的请求
- **敏感信息**: 不应该被提交到版本控制系统的配置数据（如API密钥、数据库密码等）
- **版本控制**: Git系统，用于管理代码变更历史
- **环境隔离**: 开发、测试、生产等不同环境使用不同的配置和密钥

## 需求

### 需求 1: 从代码中移除暴露的API密钥

**用户故事**: 作为安全管理员，我想从代码库中移除所有暴露的API密钥，以便防止未授权访问Gemini API。

#### 接受标准

1. WHEN 代码库被扫描时，THE 系统 SHALL 不包含任何硬编码的Gemini API密钥
2. WHEN 检查config.ts文件时，THE 系统 SHALL 确保GEMINI_API_KEY字段为空字符串
3. WHEN 检查.env.local文件时，THE 系统 SHALL 确保不包含任何真实的API密钥值
4. WHEN 检查项目文档时，THE 系统 SHALL 不包含任何示例API密钥或真实密钥

### 需求 2: 实现环境变量管理

**用户故事**: 作为开发者，我想通过环境变量管理API密钥，以便在不同环境中使用不同的凭证。

#### 接受标准

1. WHEN 应用程序启动时，THE 系统 SHALL 从环境变量VITE_GEMINI_API_KEY读取API密钥
2. WHEN 环境变量未设置时，THE 系统 SHALL 显示清晰的错误消息指导用户配置
3. WHEN 应用程序运行时，THE 系统 SHALL 不在浏览器控制台或日志中暴露完整的API密钥
4. WHEN 构建应用程序时，THE 系统 SHALL 确保API密钥不被打包到生产构建中

### 需求 3: 配置Git忽略规则

**用户故事**: 作为开发者，我想确保环境配置文件不会被意外提交到Git，以便防止密钥泄露。

#### 接受标准

1. WHEN 检查.gitignore文件时，THE 系统 SHALL 包含.env.local条目
2. WHEN 检查.gitignore文件时，THE 系统 SHALL 包含.env条目
3. WHEN 检查.gitignore文件时，THE 系统 SHALL 包含.env.*.local条目以覆盖所有本地环境文件
4. WHEN 尝试提交.env.local文件时，THE Git系统 SHALL 拒绝提交

### 需求 4: 创建环境配置模板

**用户故事**: 作为开发者，我想有一个.env.example文件作为模板，以便新开发者知道需要配置哪些环境变量。

#### 接受标准

1. WHEN 查看项目文档时，THE 系统 SHALL 提供.env.example文件
2. WHEN 查看.env.example文件时，THE 系统 SHALL 包含所有必需的环境变量名称
3. WHEN 查看.env.example文件时，THE 系统 SHALL 不包含任何真实的API密钥值
4. WHEN 新开发者克隆项目时，THE 系统 SHALL 通过.env.example清晰地指示需要配置的变量

### 需求 5: 实现后端API代理（可选）

**用户故事**: 作为系统架构师，我想实现后端API代理，以便在生产环境中安全地管理API密钥。

#### 接受标准

1. WHERE 后端代理被启用时，THE 系统 SHALL 提供/api/bazi-interpret端点
2. WHEN 前端调用后端代理时，THE 系统 SHALL 使用服务器端存储的API密钥调用Gemini API
3. WHEN 后端代理接收请求时，THE 系统 SHALL 验证请求的有效性
4. WHEN Gemini API返回响应时，THE 系统 SHALL 将响应转发给前端客户端
5. WHEN 后端代理处理错误时，THE 系统 SHALL 返回适当的HTTP状态码和错误消息

### 需求 6: 更新项目文档

**用户故事**: 作为文档维护者，我想更新项目文档，以便开发者了解如何正确配置API密钥。

#### 接受标准

1. WHEN 查看README.md时，THE 系统 SHALL 包含清晰的环境变量配置说明
2. WHEN 查看README.md时，THE 系统 SHALL 包含.env.local文件的设置步骤
3. WHEN 查看README.md时，THE 系统 SHALL 包含安全最佳实践的说明
4. WHEN 查看README.md时，THE 系统 SHALL 不包含任何真实的API密钥示例

### 需求 7: 实现密钥验证和错误处理

**用户故事**: 作为开发者，我想在应用启动时验证API密钥配置，以便及时发现配置问题。

#### 接受标准

1. WHEN 应用程序初始化时，THE 系统 SHALL 检查VITE_GEMINI_API_KEY环境变量是否存在
2. IF 环境变量未设置或为空时，THEN THE 系统 SHALL 抛出明确的错误消息
3. WHEN 用户尝试使用AI解读功能时，THE 系统 SHALL 验证API密钥的有效性
4. IF API密钥无效时，THEN THE 系统 SHALL 显示用户友好的错误消息而不暴露密钥内容

### 需求 8: 实现安全的日志记录

**用户故事**: 作为安全工程师，我想确保日志中不会记录敏感的API密钥信息，以便防止通过日志泄露。

#### 接受标准

1. WHEN 应用程序记录API相关信息时，THE 系统 SHALL 不记录完整的API密钥
2. WHEN 记录API密钥状态时，THE 系统 SHALL 仅记录密钥是否存在（布尔值）或密钥长度
3. WHEN 记录API调用错误时，THE 系统 SHALL 不在错误消息中包含API密钥
4. WHEN 应用程序在生产环境运行时，THE 系统 SHALL 禁用包含敏感信息的调试日志

