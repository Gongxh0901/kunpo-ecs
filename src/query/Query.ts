/**
 * @Author: Gongxh
 * @Date: 2025-05-15
 * @Description: 查询结果迭代器
 */

import { Component } from "../component/Component";
import { ComponentPool } from "../component/ComponentPool";
import { ComponentType } from "../component/ComponentType";
import { IComponent } from "../component/IComponent";
import { Entity } from "../entity/Entity";
import { EntityPool } from "../entity/EntityPool";
import { IQuery, IQueryEvent, IQueryResult } from "./IQuery";
import { Matcher } from "./Matcher";

/** 临时实体集合 去重用 */
const temporaryEntitySet = new Set<Entity>();

export class Query implements IQuery, IQueryResult, IQueryEvent {
    entityPool: EntityPool; // 实体池
    componentPool: ComponentPool; // 组件池

    matcher: Matcher;

    cachedEntities: Entity[] = [];
    cachedComponents: IComponent[][] = [];

    changeEntities: Set<Entity> = new Set();
    matchEntities: Map<Entity, number> = new Map();
    needFullRefresh: boolean = false;

    constructor(componentPool: ComponentPool, entityPool: EntityPool, matcher: Matcher) {
        this.componentPool = componentPool;
        this.entityPool = entityPool;
        this.matcher = matcher;

        this.cachedEntities.length = 0;

        let components = matcher.components;
        let len = components.length;
        for (let i = 0; i < len; i++) {
            this.cachedComponents[components[i]] = [];
        }
    }

    public changeEntity(entity: Entity): void {
        if (this.needFullRefresh) {
            return;
        }
        this.changeEntities.add(entity);
        if (this.changeEntities.size > 100) {
            this.needFullRefresh = true;
            this.changeEntities.clear();
        }
    }

    public batchChangeEntities(entities: Entity[]): void {
        if (this.needFullRefresh) {
            return;
        }
        if (this.changeEntities.size + entities.length > 100) {
            this.needFullRefresh = true;
            this.changeEntities.clear();
            return;
        }
        for (let i = 0; i < entities.length; i++) {
            this.changeEntities.add(entities[i]);
        }
    }

    /**
     * 迭代满足条件的实体
     * @returns 满足条件的实体
     */
    public entities(): Entity[] {
        if (this.needFullRefresh) {
            this.cacheReset();
            this.needFullRefresh = false;
            this.changeEntities.clear();
        } else if (this.changeEntities.size > 0) {
            this.cacheRefresh();
            this.changeEntities.clear();
        }
        return this.cachedEntities;
    }

    public components<T extends Component>(comp: ComponentType<T>): T[] {
        if (this.needFullRefresh) {
            this.cacheReset();
            this.needFullRefresh = false;
            this.changeEntities.clear();
        } else if (this.changeEntities.size > 0) {
            this.cacheRefresh();
            this.changeEntities.clear();
        }
        return this.cachedComponents[comp.ctype] as T[];
    }

    public cacheRefresh(): void {
        for (let entity of this.changeEntities.values()) {
            let mask = this.entityPool.getMask(entity);
            let hasMatch = this.matchEntities.has(entity);
            if (mask && this.matcher.isMatch(mask)) {
                // 直接添加
                let index = this.cachedEntities.length;
                if (hasMatch) {
                    index = this.matchEntities.get(entity);
                }
                this.cachedEntities[index] = entity;
                this.matchEntities.set(entity, index);

                this.componentPool.getComponentBatch(entity, this.matcher.components, this.cachedComponents, index);
            } else if (hasMatch) {
                let components = this.matcher.components;

                // 实体被删除了, 从缓存中移除
                let index = this.matchEntities.get(entity);
                const lastIndex = this.cachedEntities.length - 1;
                if (index !== lastIndex) {
                    // 移动最后一个元素到要删除的元素位置
                    this.cachedEntities[index] = this.cachedEntities[lastIndex];
                    // 更新索引
                    this.matchEntities.set(this.cachedEntities[index], index);
                    // 更新组件位置
                    let len = components.length;
                    for (let i = 0; i < len; i++) {
                        let list = this.cachedComponents[components[i]];
                        list[index] = list[lastIndex];
                    }
                }
                this.cachedEntities.pop();
                this.matchEntities.delete(entity);
                let len = components.length;
                for (let i = 0; i < len; i++) {
                    this.cachedComponents[components[i]].pop();
                }
            }
        }
    }

    /** 
     * 检查必须包含的组件类型对应的实体最少的 
     * @returns 组件类型 -1: 没有必须包含的配置 0: 实体数为0 其他: 组件类型
     * @internal
     */
    private checkAllOf(): number {
        const matcher = this.matcher;
        let componentPool = this.componentPool;
        // 必须全部包含的组件类型 取出最少的一个池子
        if (!matcher.ruleAllOf) {
            return -1;
        }
        // 找出必须包含的组件类型对应的实体最少的组件
        let lessType: number = -1;
        let lessSize: number = Infinity;

        const indices = matcher.ruleAllOf.indices;
        let len = indices.length;
        for (let i = 0; i < len; i++) {
            let type = indices[i];
            let size = componentPool.getEntityCount(type);
            if (size === 0) {
                return 0;
            }
            if (size < lessSize) {
                lessSize = size;
                lessType = type;
            }
        }
        return lessType;
    }

    /** 预分配空间 */
    private preAllocate(count: number): void {
        // 预分配足够空间，避免动态扩容
        this.cachedEntities.length = count;

        const components = this.matcher.components
        const len = components.length;
        for (let i = 0; i < len; i++) {
            this.cachedComponents[components[i]].length = count;
        }
    }

    public cacheReset(): void {
        const matcher = this.matcher;
        let componentPool = this.componentPool;
        let lessType = this.checkAllOf();
        let total = 0;
        if (lessType === -1) {
            let anyTypes = matcher.ruleAnyOf.indices;
            // 使用Set去重 这里会产生GC
            for (let type of anyTypes) {
                let dense = componentPool.getPool(type);
                dense.forEachEntity(entity => temporaryEntitySet.add(entity));
            }
            this.preAllocate(temporaryEntitySet.size);
            temporaryEntitySet.forEach(entity => {
                if (matcher.isMatch(this.entityPool.getMask(entity))) {
                    this.cachedEntities[total] = entity;
                    componentPool.getComponentBatch(entity, matcher.components, this.cachedComponents, total);
                    total++;
                }
            });
            temporaryEntitySet.clear();
            this.trimCache(total);
        } else if (lessType !== 0) {
            // 存在必须包含的组件类型
            // 从最小集合开始筛选 - 避免全量扫描
            let dense = componentPool.getPool(lessType);
            const size = dense.size;
            this.preAllocate(size);

            dense.forEachEntity((entity) => {
                if (!matcher.isMatch(this.entityPool.getMask(entity))) {
                    return;
                }
                this.cachedEntities[total] = entity;
                componentPool.getComponentBatch(entity, matcher.components, this.cachedComponents, total);
                total++;
            });
        }
        // 如果结果数量小于预分配空间，裁剪数组
        this.trimCache(total);
    }

    /**
     * 截取缓存数组长度
     */
    private trimCache(length: number): void {
        this.cachedEntities.length = length;

        let components = this.matcher.components;
        let len = components.length;
        for (let i = 0; i < len; i++) {
            this.cachedComponents[components[i]].length = length;
        }

        // 重建实体的索引
        this.matchEntities.clear();
        for (let i = 0; i < length; i++) {
            this.matchEntities.set(this.cachedEntities[i], i);
        }
    }

    public clear(): void {
        this.cachedEntities = [];
        this.changeEntities.clear();
        this.matchEntities.clear();

        let components = this.matcher.components;
        let len = components.length;
        for (let i = 0; i < len; i++) {
            this.cachedComponents[components[i]] = [];
        }
    }
}