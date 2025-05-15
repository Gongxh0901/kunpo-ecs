/**
 * @Author: Gongxh
 * @Date: 2025-05-15
 * @Description: 系统基类
 */

import { Query } from "./interface/Query";
import { QueryBuilder } from "./interface/QueryBuilder";
import { World } from "./World";

abstract class System {
    protected queries: Map<string, Query> = new Map();

    constructor(protected world: World) {

    }

    // 初始化系统
    init(): void {
        this.setupQueries();
    }

    // 子类实现此方法来设置查询
    protected abstract setupQueries(): void;

    // 添加查询
    protected addQuery(name: string, querySetup: (builder: QueryBuilder) => QueryBuilder): void {
        // const query = querySetup(this.world.createQuery()).build();
        // this.queries.set(name, query);
    }

    // 获取查询
    protected getQuery(name: string): Query {
        return this.queries.get(name)!;
    }

    // 系统更新方法
    abstract update(deltaTime: number): void;
}