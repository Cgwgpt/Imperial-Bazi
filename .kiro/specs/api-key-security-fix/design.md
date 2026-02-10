# API密钥安全修复设计文档

## 概述

本设计文档定义了修复Imperial Bazi Pro中API密钥泄露问题的完整技术方案。该方案包括三个核心层面：

1. **前端环境隔离**: 通过环境变量和构建配置确保API密钥不被打包到生产构建中
2. **后端代理层** (可选): 实现服务器端API代理，在生产环境中安全管理API密钥
3. **安全防护措施**: 包括Git配置、日志管理和错误处理

## 架构

### 当前架构（存在问题）
```
浏览器 -> Gemini API
         (直接使用硬编码密钥)
```

### 修复后的架构（推荐）
```
浏览器 -> 后端API代理 -> Gemini API
         (使用环境变量)  (服务器端密钥)
```

### 过渡方案（快速修复）
```
浏览器 -> Gemini API
         (使用环境变量，仅开发环境)
```

## 组件和接口

### 1. 环境变量管理

#### 前端环境变量
- `VITE_GEMINI_API_KEY`: Gemini API密钥（仅开发环境）
- `VITE_API_PROXY_URL`: 后端代理URL（生产环境）

#### 后端环境变量
- `GEMINI_API_KEY`: Gemini API密钥（服务器端）
- `NODE_ENV`: 运行环境（development/production）

### 2. 前端API客户端

#### 接口定义
```typescript
interface AIInterpretRequest {
  baziChart: BaziChart;
  language: 'zh' | 'en';
}

interface AIInterpretResponse {
  interpretation: string;
  confidence: number;
}

interface APIClient {
  interpretBazi(request: AIInterpretRequest): Promise<AIInterpretResponse>;
}
```

#### 实现策略
- 创建`utils/apiClient.ts`模块
- 根据环境变量选择直接调用或代理调用
- 实现请求/响应拦截器用于日志和错误处理
- 不在任何地方暴露完整的API密钥

### 3. 后端API代理（可选）

#### 端点定义
```
POST /api/bazi-interpret
Content-Type: application/json

Request:
{
  "baziChart": { ... },
  "language": "zh"
}

Response:
{
  "interpretation": "...",
  "confidence": 0.95
}

Error Response:
{
  "error": "Invalid request",
  "code": "INVALID_REQUEST"
}
```

#### 实现技术栈
- Node.js + Express (或类似框架)
- 使用`@google/generative-ai`库
- 实现请求验证和速率限制
- 添加请求日志（不记录敏感信息）

### 4. 安全日志系统

#### 日志策略
- 记录API调用的开始和结束
- 记录密钥存在状态（布尔值）而不是密钥本身
- 记录密钥长度而不是密钥内容
- 在生产环境禁用详细的调试日志

#### 日志格式
```typescript
interface APILog {
  timestamp: string;
  action: string;
  hasApiKey: boolean;
  keyLength?: number;
  status: 'success' | 'error';
  errorCode?: string;
  environment: string;
}
```

## 数据模型

### 环境配置
```typescript
interface EnvironmentConfig {
  apiKey: string | null;
  apiProxyUrl: string | null;
  environment: 'development' | 'production';
  isDevelopment: boolean;
  isProduction: boolean;
}

interface APIKeyStatus {
  isConfigured: boolean;
  keyLength: number;
  lastValidated: Date;
  isValid: boolean;
}
```

### 错误类型
```typescript
class APIKeyError extends Error {
  code: 'MISSING_KEY' | 'INVALID_KEY' | 'PROXY_ERROR';
  userMessage: string;
}

class ProxyError extends Error {
  code: 'INVALID_REQUEST' | 'GEMINI_ERROR' | 'RATE_LIMIT';
  statusCode: number;
}
```

## 正确性属性

一个属性是一个特征或行为，应该在系统的所有有效执行中保持真实——本质上是关于系统应该做什么的正式陈述。属性充当人类可读规范和机器可验证正确性保证之间的桥梁。

### Property 1: 环境变量读取正确性
*对于任何* 设置了VITE_GEMINI_API_KEY环境变量的环境，应用程序初始化时应该能够读取该变量的值。
**验证: 需求 2.1**

### Property 2: 密钥不在生产构建中
*对于任何* 生产构建输出，构建产物中不应该包含任何Gemini API密钥。
**验证: 需求 2.4**

### Property 3: 日志中不暴露完整密钥
*对于任何* 应用程序运行时生成的日志，日志内容中不应该包含完整的API密钥字符串。
**验证: 需求 2.3, 8.1**

### Property 4: 配置文件密钥为空
*对于任何* config.ts文件的读取，GEMINI_API_KEY字段应该是空字符串。
**验证: 需求 1.2**

### Property 5: .gitignore包含环境文件
*对于任何* .gitignore文件的读取，文件应该包含.env.local、.env和.env.*.local条目。
**验证: 需求 3.1, 3.2, 3.3**

### Property 6: .env.example包含所有必需变量
*对于任何* .env.example文件的读取，文件应该包含所有必需的环境变量名称（VITE_GEMINI_API_KEY等）。
**验证: 需求 4.2**

### Property 7: .env.example不包含真实密钥
*对于任何* .env.example文件的读取，文件不应该包含任何真实的API密钥值。
**验证: 需求 4.3**

### Property 8: 文档中不包含密钥
*对于任何* 项目文档文件的扫描，文档不应该包含任何真实的或示例的Gemini API密钥。
**验证: 需求 1.4, 6.4**

### Property 9: 缺少密钥时显示错误
*对于任何* 在没有设置VITE_GEMINI_API_KEY环境变量的情况下启动应用的尝试，应用应该显示清晰的错误消息。
**验证: 需求 2.2, 7.2**

### Property 10: 后端代理使用服务器端密钥
*对于任何* 通过后端代理的API请求，代理应该使用服务器端存储的API密钥而不是前端提供的密钥。
**验证: 需求 5.2**

### Property 11: 后端代理验证请求
*对于任何* 发送到后端代理的请求，代理应该验证请求的有效性并拒绝无效请求。
**验证: 需求 5.3**

### Property 12: 后端代理转发响应
*对于任何* 来自Gemini API的响应，后端代理应该正确转发响应给前端客户端。
**验证: 需求 5.4**

### Property 13: 后端代理错误处理
*对于任何* 后端代理处理的错误情况，代理应该返回适当的HTTP状态码和错误消息。
**验证: 需求 5.5**

### Property 14: 密钥状态日志
*对于任何* 记录API密钥状态的日志，日志应该仅包含密钥是否存在（布尔值）或密钥长度，而不是密钥内容。
**验证: 需求 8.2**

### Property 15: 错误消息不暴露密钥
*对于任何* API调用错误，错误消息中不应该包含API密钥。
**验证: 需求 7.4, 8.3**

### Property 16: 生产环境禁用调试日志
*对于任何* 在生产环境运行的应用程序，包含敏感信息的调试日志应该被禁用。
**验证: 需求 8.4**

## 错误处理

### 密钥配置错误
```typescript
// 错误场景
1. 环境变量未设置
   -> 显示: "请设置 VITE_GEMINI_API_KEY 环境变量"
   -> 日志: { hasApiKey: false, status: 'error', errorCode: 'MISSING_KEY' }

2. 环境变量为空字符串
   -> 显示: "API密钥配置为空，请检查环境变量"
   -> 日志: { hasApiKey: false, status: 'error', errorCode: 'EMPTY_KEY' }

3. API密钥无效
   -> 显示: "API密钥验证失败，请检查配置"
   -> 日志: { hasApiKey: true, keyLength: 40, status: 'error', errorCode: 'INVALID_KEY' }
```

### 后端代理错误
```typescript
// 错误场景
1. 无效的请求格式
   -> HTTP 400: { error: "Invalid request format", code: "INVALID_REQUEST" }

2. Gemini API错误
   -> HTTP 502: { error: "AI service error", code: "GEMINI_ERROR" }

3. 速率限制
   -> HTTP 429: { error: "Too many requests", code: "RATE_LIMIT" }
```

## 测试策略

### 单元测试
- 环境变量读取和验证
- 密钥状态检查
- 日志格式验证
- 错误消息生成
- 配置文件内容验证

### 属性测试
- 环境变量读取正确性（Property 1）
- 密钥不在生产构建中（Property 2）
- 日志中不暴露完整密钥（Property 3）
- 配置文件密钥为空（Property 4）
- .gitignore包含环境文件（Property 5）
- .env.example包含所有必需变量（Property 6）
- .env.example不包含真实密钥（Property 7）
- 文档中不包含密钥（Property 8）
- 缺少密钥时显示错误（Property 9）
- 后端代理使用服务器端密钥（Property 10）
- 后端代理验证请求（Property 11）
- 后端代理转发响应（Property 12）
- 后端代理错误处理（Property 13）
- 密钥状态日志（Property 14）
- 错误消息不暴露密钥（Property 15）
- 生产环境禁用调试日志（Property 16）

### 集成测试
- 前端到后端代理的完整流程
- 后端代理到Gemini API的完整流程
- 错误场景的端到端处理

### 安全测试
- 代码库中不包含硬编码密钥
- 构建产物中不包含密钥
- Git历史中不包含密钥
- 日志文件中不包含密钥

