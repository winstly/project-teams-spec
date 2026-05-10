# 技术栈识别参考

## 前端框架识别

### React
```
关键文件:
- package.json 中包含 "react", "react-dom"
- src/index.jsx 或 src/App.tsx
- tsconfig.json 配置 React JSX

识别特征:
- 使用 Hooks (useState, useEffect)
- 组件以 .tsx/.jsx 结尾
- 有 react-router-dom (SPA)
```

### Vue
```
关键文件:
- package.json 中包含 "vue"
- vue.config.js
- src/App.vue

识别特征:
- .vue 单文件组件
- 有 <template>, <script>, <style>
- 使用 Vuex 或 Pinia
```

### Angular
```
关键文件:
- angular.json
- src/app/app.module.ts
- package.json 中包含 "@angular/core"

识别特征:
- .module.ts 模块文件
- @Component 装饰器
- 有 rxjs 依赖
```

### Svelte
```
关键文件:
- package.json 中包含 "svelte"
- svelte.config.js

识别特征:
- .svelte 文件
- 无虚拟 DOM
```

## 后端语言识别

### Java
```
关键文件:
- pom.xml (Maven)
- build.gradle (Gradle)
- src/main/java/

识别特征:
- .java 文件
- Spring Boot (@SpringBootApplication)
- package com.xxx 结构
```

### Node.js/TypeScript
```
关键文件:
- package.json
- tsconfig.json
- src/index.ts

识别特征:
- "scripts": { "start", "build" }
- @types/* 依赖
```

### Go
```
关键文件:
- go.mod
- go.sum
- main.go

识别特征:
- package main
- go.mod 中的 module 名
```

### Python
```
关键文件:
- requirements.txt
- setup.py
- pyproject.toml
- venv/ 或 .venv/

识别特征:
- import 语句
- Django/Flask/FastAPI
```

## 数据库识别

### 关系型数据库

```
MySQL:
- 连接字符串包含 mysql://
- 配置文件中有 mysql
- pom.xml 中有 mysql-connector-java

PostgreSQL:
- 连接字符串包含 postgresql://
- pg_ 前缀的表（如果有迁移）
- psycopg2 依赖（Python）

SQLite:
- *.db, *.sqlite, *.sqlite3 文件
- 无需独立数据库服务

Oracle:
- 连接字符串包含 oracle://
- ojdbc*.jar 依赖
```

### NoSQL 数据库

```
MongoDB:
- mongodb:// 连接字符串
- mongoose 依赖（Node.js）
- mongodump 命令

Redis:
- redis:// 连接字符串
- ioredis / redis-py 依赖
- keys 命令模式

Cassandra:
- 连接字符串包含 cassandra
- CassandraJDBC*.jar
```

## 构建工具识别

### JavaScript/Node.js

| 工具 | 识别方式 |
|------|---------|
| npm | package-lock.json 存在 |
| yarn | yarn.lock 存在 |
| pnpm | pnpm-lock.yaml 存在 |
| webpack | webpack.config.js |
| vite | vite.config.ts |
| esbuild | esbuild.config.js |
| rollup | rollup.config.js |

### Java

| 工具 | 识别方式 |
|------|---------|
| Maven | pom.xml |
| Gradle | build.gradle |
| Ant | build.xml |

### Go

| 工具 | 识别方式 |
|------|---------|
| Go Modules | go.mod |
| Make | Makefile |
| Mage | magefile.go |

## 中间件与服务识别

```
Docker:
- Dockerfile
- docker-compose.yml
- .dockerignore

Kubernetes:
- k8s/
- *.yaml (Deployment, Service)
- helm/ 目录

消息队列:
- Kafka: kafka 连接配置, confluent 依赖
- RabbitMQ: amqp:// 连接, rabbitmq 依赖

缓存:
- Redis: redis 连接配置
- Memcached: memcached 配置

搜索引擎:
- Elasticsearch: elasticsearch 连接配置
- Solr: solr 配置
```

## 配置文件模式

### 配置文件名称模式

```
环境配置:
- .env
- .env.local
- .env.development
- .env.production

API 配置:
- api-config.json
- config.ts
- settings.py

数据库配置:
- database.yml
- db-config.json
- application.properties
```

## 模块依赖分析

### 依赖分析工具

```
JavaScript/Node.js:
- npm ls (依赖树)
- yarn list
- pnpm list

Java:
- mvn dependency:tree
- gradle dependencies

Python:
- pip freeze
- pipreqs (依赖文件生成)
```