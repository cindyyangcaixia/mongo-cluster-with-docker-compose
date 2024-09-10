### docker compose 启动 mongodb 集群

待解决问题：mongodb 集群启动后，无法连接集群

1、启动 mongodb 实例

```
docker-compose up -d
```

2、登录到主节点（随便选一台）

```
mongosh mongodb://user:pass@127.0.0.1:27017
```

3、设置主节点

```
rs.initiate(
  {
    _id: "rs1",
    version: 1,
    members: [
      { _id: 0, host : "mongo_1:27017", priority: 1 }
    ]
  }
);
rs.conf()  // 查看配置
rs.status() // 查看集群状态
```

4、添加成员到副本集

```
rs.add({ host: 'mongo_2:27017', priority: 0 })
rs.add({ host: 'mongo_3:27017', priority: 0 })
rs.status() // 查看集群状态
```

5、创建用户

```
use naxx;
db.createUser({
  user: 'user',
  pwd: 'pass',
  roles: [
    {
      role: 'dbOwner',
      db: 'naxx'
    }
  ]
});
```

6、连接集群

连接集群时出错，无法连接

```
mongosh mongodb://user:pass@127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/naxx?replicaSet=rs1
```

用 mongoose 连接也失败了。

```
yarn
node connect.js

```

### 各种尝试

- 集群状态正常

```
mongosh mongodb://user:pass@127.0.0.1:27017/naxx
rs.status()
```

- mongosh 连接单个节点是 OK 的

```
mongosh mongodb://user:pass@127.0.0.1:27017/naxx
mongosh mongodb://user:pass@127.0.0.1:27018/naxx
mongosh mongodb://user:pass@127.0.0.1:27019/naxx
```

- 集群主从数据同步是 OK 的，登录到主节点，插入一条记录，再登录到两个从节点，主节点插入的数据同步成功

```
mongosh mongodb://user:pass@127.0.0.1:27017/naxx
db.students.insertOne({ name: 'happy' })
mongosh mongodb://user:pass@127.0.0.1:27018/naxx
db.students.find()
```

- 在各个节点的容器内部，可以连接另外两个节点的 db

```
docker ps
docker exec -it 24147a63b33f /bin/bash
mongosh mongodb://user:pass@mongo_1:27017/naxx
mongosh mongodb://user:pass@mongo_2:27017/naxx
mongosh mongodb://user:pass@mongo_3:27017/naxx
```

通过以上尝试，mongodb 集群状态正常，各个节点内部通讯正常，数据同步正常，连接单个节点 db 身份验证正常。

###### 备注：

切换从节点的同步节点

```

rs.syncFrom("mongo_1:27017");

```

生成 keyfile

```
openssl rand -base64 756 > <path-to-keyfile>
chmod 400 <path-to-keyfile>
```

### 单节点 mongodb 集群

docker compose file 文件：docker-compose_single_node.yaml
带用户认证 docker compose file 文件：docker-compose_single_node.yaml

```
docker-compose up -d mongodb_rs
```

```
docker exec -it mongodb_rs mongosh
```

查看 ip 地址

```
ifconfig en0
```

```
rs.initiate({
   _id : "rs0",
   members: [
      { _id: 0, host: "<本机ip地址>:27017" },
   ]
})
```

```
mongosh mongodb://127.0.0.1:27017/naxx
```

带认证

```
mongosh mongodb://user:pass@127.0.0.1:27017/naxx
```

更新集群配置

```
rs.reconfig(config, { force: true })
```
清理：
```
docker volume rm $(docker volume ls -qf dangling=true)
docker volume prune
```
