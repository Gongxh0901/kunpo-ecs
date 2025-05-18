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
import { createMask, IMask } from "../utils/IMask";
import { IQuery, IQueryEvent, IQueryResult } from "./IQuery";

export class Query implements IQuery, IQueryResult, IQueryEvent {
    entityPool: EntityPool; // 实体池
    componentPool: ComponentPool; // 组件池

    _includeMask: IMask; // 必须包含的组件掩码
    _excludeMask: IMask; // 必须排除的组件掩码

    includes: number[] = []; // 必须包含的组件
    excludes: number[] = []; // 必须排除的组件
    optionals: number[] = []; // 可选组件

    cachedEntities: Entity[] = [];
    cachedComponents: IComponent[][] = [];

    changeEntities: Set<Entity> = new Set();
    matchEntities: Map<Entity, number> = new Map();
    needFullRefresh: boolean = false;

    constructor(componentPool: ComponentPool, entityPool: EntityPool, includes: number[], excludes: number[], optionals: number[]) {
        this.componentPool = componentPool;
        this.entityPool = entityPool;

        this.includes = includes;
        this.excludes = excludes;
        this.optionals = optionals;

        this._includeMask = createMask();
        this._excludeMask = createMask();

        let len = includes.length;
        for (let i = 0; i < len; i++) {
            this._includeMask.set(includes[i]);
            this.cachedComponents[includes[i]] = [];
        }

        len = excludes.length;
        for (let i = 0; i < len; i++) {
            this._excludeMask.set(excludes[i]);
        }

        len = optionals.length;
        for (let i = 0; i < len; i++) {
            this.cachedComponents[optionals[i]] = [];
        }
    }

    public changeEntity(entity: Entity): void {
        if (this.needFullRefresh) {
            return;
        }
        this.changeEntities.add(entity);
    }

    public changeBatchEntities(entities: Set<Entity>): void {
        if (this.needFullRefresh) {
            return;
        }
        if (entities.size > 1000) {
            this.needFullRefresh = true;
        } else {
            for (const entity of entities) {
                this.changeEntities.add(entity);
            }
        }
    }

    /**
     * 迭代满足条件的实体
     * @returns 满足条件的实体
     */
    public entities(): Entity[] {
        if (this.needFullRefresh) {
            this.resetCache();
            this.needFullRefresh = false;
            this.changeEntities.clear();
        } else if (this.changeEntities.size > 0) {
            this.refreshCache();
            this.changeEntities.clear();
        }
        return this.cachedEntities;
    }

    public components<T extends Component>(comp: ComponentType<T>): T[] {
        if (this.needFullRefresh) {
            this.resetCache();
            this.needFullRefresh = false;
            this.changeEntities.clear();
        } else if (this.changeEntities.size > 0) {
            this.refreshCache();
            this.changeEntities.clear();
        }
        return this.cachedComponents[comp.ctype] as T[];
    }

    public refreshCache(): void {
        for (let entity of this.changeEntities.values()) {
            let entityMask = this.entityPool.getMask(entity);
            let hasMatch = this.matchEntities.has(entity);
            if (entityMask && entityMask.include(this._includeMask) && !entityMask.any(this._excludeMask)) {
                // 直接添加
                let index = this.cachedEntities.length;
                if (hasMatch) {
                    index = this.matchEntities.get(entity);
                }
                this.cachedEntities[index] = entity;
                this.matchEntities.set(entity, index);
                this.componentPool.getComponentBatch(entity, this.includes, this.cachedComponents, index);
                this.componentPool.getComponentBatch(entity, this.optionals, this.cachedComponents, index);
            } else if (hasMatch) {
                // 实体被删除了, 从缓存中移除
                let index = this.matchEntities.get(entity);
                const lastIndex = this.cachedEntities.length - 1;
                if (index !== lastIndex) {
                    // 移动最后一个元素到要删除的元素位置
                    this.cachedEntities[index] = this.cachedEntities[lastIndex];
                    // 更新索引
                    this.matchEntities.set(this.cachedEntities[index], index);
                    // 更新组件位置
                    let len = this.includes.length;
                    for (let i = 0; i < len; i++) {
                        let list = this.cachedComponents[this.includes[i]];
                        list[index] = list[lastIndex];
                    }
                    len = this.optionals.length;
                    for (let i = 0; i < len; i++) {
                        let list = this.cachedComponents[this.optionals[i]];
                        list[index] = list[lastIndex];
                    }
                }
                this.cachedEntities.pop();
                this.matchEntities.delete(entity);
                let len = this.includes.length;
                for (let i = 0; i < len; i++) {
                    this.cachedComponents[this.includes[i]].pop();
                }
                len = this.optionals.length;
                for (let i = 0; i < len; i++) {
                    this.cachedComponents[this.optionals[i]].pop();
                }
            }
        }
    }

    public resetCache(): void {
        // 如果没有必须条件 直接返回
        if (this._includeMask.isEmpty()) {
            this.trimCache(0);
            return;
        }
        let componentPool = this.componentPool;

        // 找出必须包含的组件类型对应的实体最少的组件
        let smallestComponentType: number = -1;
        let smallestSize: number = Infinity;
        let len = this.includes.length;
        for (let i = 0; i < len; i++) {
            let typeId = this.includes[i];
            let size = componentPool.getEntityCount(typeId);
            if (size > 0 && size < smallestSize) {
                smallestSize = size;
                smallestComponentType = typeId;
            }
        }

        // 如果没有找到任何必需组件，直接返回
        if (smallestComponentType === -1) {
            this.trimCache(0);
            return;
        }
        // 2. 从最小集合开始筛选 - 避免全量扫描
        const entities = componentPool.getEntitiesByComponentType(smallestComponentType);

        // 3. 预分配足够空间，避免动态扩容
        len = entities.length;
        this.cachedEntities.length = len;
        this.cachedComponents.forEach((components) => {
            components.length = len;
        });

        let total = 0;
        // 4. 高效遍历和筛选
        for (let i = 0; i < len; i++) {
            const entity = entities[i];
            const entityMask = this.entityPool.getMask(entity);
            // 一次性检查所有条件，减少分支预测失败
            if (entityMask.include(this._includeMask) && !entityMask.any(this._excludeMask)) {
                this.cachedEntities[total] = entity;
                // 批量获取必须组件
                componentPool.getComponentBatch(entity, this.includes, this.cachedComponents, total);
                // 批量获取可选组件
                componentPool.getComponentBatch(entity, this.optionals, this.cachedComponents, total);
                total++;
            }
        }
        // 如果结果数量小于预分配空间，裁剪数组
        this.trimCache(total);
    }

    /**
     * 截取缓存数组长度
     */
    private trimCache(length: number): void {
        this.cachedEntities.length = length;
        let len = this.includes.length;
        for (let i = 0; i < len; i++) {
            this.cachedComponents[this.includes[i]].length = length;
        }
        len = this.optionals.length;
        for (let i = 0; i < len; i++) {
            this.cachedComponents[this.optionals[i]].length = length;
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

        let len = this.includes.length;
        for (let i = 0; i < len; i++) {
            this.cachedComponents[this.includes[i]] = [];
        }
        len = this.optionals.length;
        for (let i = 0; i < len; i++) {
            this.cachedComponents[this.optionals[i]] = [];
        }
    }
}