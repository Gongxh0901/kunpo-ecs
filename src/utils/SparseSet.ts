/**
 * 稀疏集合 (SparseSet) 实现
 * 一种高效的数据结构，用于ECS系统中存储和管理组件
 * 提供O(1)复杂度的添加、删除和查找操作
 */

import { IComponent } from "../component/IComponent";
import { Entity } from "../entity/Entity";
export class SparseSet<T extends IComponent> {
    /**
     * 存储实际组件数据的数组
     * @internal
     */
    private dense: T[] = [];

    /**
     * 实体到数组索引的映射 (实体 -> 数组索引)
     * @internal
     */
    private readonly entityToIndex: Map<Entity, number> = new Map();

    /**
     * 索引到实体的反向
     * @internal
     */
    private entities: Entity[] = [];

    /** 热路径LRU缓存 @internal */
    // private cache: LRUCache<Entity, number> = new LRUCache(256);

    /**
     * 添加或更新组件
     * @param entity 实体
     * @param component 组件数据
     * @internal
     */
    public add(entity: Entity, component: T): void {
        // 添加到密集数组末尾
        const index = this.dense.length;
        this.dense.push(component);
        this.entities.push(entity);
        // 更新映射
        this.entityToIndex.set(entity, index);
        // 更新缓存
        // this.cache.put(entity, index);
    }

    /**
     * 删除实体上的组件
     * @param entity 实体
     * @returns 返回被删除的组件
     * @internal
     */
    public remove(entity: Entity): T {
        const index = this.entityToIndex.get(entity)!;
        const lastIndex = this.dense.length - 1;

        // 如果不是最后一个元素，用最后一个元素替换被删除的元素
        if (index !== lastIndex) {
            const lastEntity = this.entities[lastIndex];
            // 移动最后一个元素到要删除的元素位置
            this.dense[index] = this.dense[lastIndex];
            this.entities[index] = lastEntity;
            // 更新最后一个元素的映射
            this.entityToIndex.set(lastEntity, index);
            // 更新缓存
            // this.cache.put(lastEntity, index);
        }

        // 移除最后一个元素
        this.entities.pop();
        // 清理映射和缓存
        this.entityToIndex.delete(entity);
        // this.cache.delete(entity);
        return this.dense.pop();
    }

    /**
     * 获取组件
     * @param entity 实体
     * @returns 组件
     * @internal
     */
    public get(entity: Entity): T {
        // // 1. 现充缓存中查找
        // let index = this.cache.get(entity);
        // // 2. 缓存未命中
        // if (index === undefined) {
        //     index = this.entityToIndex.get(entity);
        //     // 更新缓存
        //     this.cache.put(entity, index);
        // }
        return this.dense[this.entityToIndex.get(entity)];
    }

    /**
     * 遍历所有组件
     * @param callback 回调函数，参数为组件和实体ID
     * @internal
     */
    public forEach(callback: (component: T, entity: Entity) => void): void {
        let len = this.dense.length;
        for (let i = 0; i < len; i++) {
            callback(this.dense[i], this.entities[i]);
        }
    }

    /**
     * 获取组件总数 也就是实体数量
     * @internal
     */
    public get size(): number {
        return this.dense.length;
    }

    /**
     * 清理所有内容
     * @internal
     */
    public dispose(): void {
        this.dense = [];
        this.entities = [];
        this.entityToIndex.clear();
        // this.cache.clear();
    }

    /**
     * 获取包含此组件的所有实体
     */
    public getEntities(): Entity[] {
        return this.entities;
    }

    /**
     * 获取所有组件
     */
    public getComponents(): T[] {
        return this.dense;
    }

    // /**
    //  * 实现迭代器接口，支持for...of循环
    //  * @internal
    //  */
    // public *[Symbol.iterator](): Iterator<[Entity, T]> {
    //     for (let i = 0; i < this.dense.length; i++) {
    //         yield [this.entities[i], this.dense[i]];
    //     }
    // }

    // /**
    //  * 仅迭代组件
    //  * @internal
    //  */
    // public *values(): IterableIterator<T> {
    //     for (const component of this.dense) {
    //         yield component;
    //     }
    // }

    // /**
    //  * 仅迭代实体ID
    //  * @internal
    //  */
    // public *keys(): IterableIterator<Entity> {
    //     for (const entity of this.entities) {
    //         yield entity;
    //     }
    // }
} 