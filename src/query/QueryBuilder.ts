/**
 * @Author: Gongxh
 * @Date: 2025-05-15
 * @Description: 查询构建器模式
 */

import { ComponentType } from "../component/ComponentType";
import { IComponent } from "../component/IComponent";
import { Query } from "./Query";
import { QueryPool } from "./QueryPool";

// 示例查询构建器接口
export class QueryBuilder {

    /**
     * 查询器池引用
     * @internal
     */
    private queryPool: QueryPool;

    /**
     * 必须包含的组件掩码
     * @internal
     */
    private includeComponents: number[] = [];

    /**
     * 必须排除的组件掩码
     * @internal
     */
    private excludeComponents: number[] = [];

    /**
     * 可选包含的组件掩码
     * @internal
     */
    private optionalComponents: number[] = [];

    /**
     * 必须包含的组件
     * @param componentPool 组件池
     */
    constructor(queryPool: QueryPool) {
        this.queryPool = queryPool;

        this.includeComponents.length = 0;
        this.excludeComponents.length = 0;
        this.optionalComponents.length = 0;
    }

    /**
     * 必须包含的组件
     * @param componentTypes 组件类型
     */
    public with<T extends IComponent>(...componentTypes: ComponentType<T>[]): QueryBuilder {
        let len = componentTypes.length;
        for (let i = 0; i < len; i++) {
            this.includeComponents.push(componentTypes[i].ctype);
        }
        return this;
    }

    /**
     * 必须排除的组件
     * @param componentTypes 组件类型
     */
    public without<T extends IComponent>(...componentTypes: ComponentType<T>[]): QueryBuilder {
        let len = componentTypes.length;
        for (let i = 0; i < len; i++) {
            this.excludeComponents.push(componentTypes[i].ctype);
        }
        return this;
    }

    /**
     * 可选包含的组件
     * @param componentTypes 组件类型
     */
    public optional<T extends IComponent>(...componentTypes: ComponentType<T>[]): QueryBuilder {
        let len = componentTypes.length;
        for (let i = 0; i < len; i++) {
            this.optionalComponents.push(componentTypes[i].ctype);
        }
        return this;
    }

    // 构建并返回查询结果
    public build(): Query {
        let key = this.generateQueryKey();
        return this.queryPool.add(key, this.includeComponents, this.excludeComponents, this.optionalComponents);
    }

    /** 
     * 对查询器生成唯一识别码
     * @returns 唯一识别码
     * @internal
     */
    private generateQueryKey(): string {
        // 预先排序组件数组以确保相同内容的查询产生相同的键
        const includeKey = this.includeComponents.slice().sort().join('&');
        const excludeKey = this.excludeComponents.slice().sort().join('&');
        const optionalKey = this.optionalComponents.slice().sort().join('&');
        // 组合键
        return `${includeKey}|${excludeKey}|${optionalKey}`;
    }
}