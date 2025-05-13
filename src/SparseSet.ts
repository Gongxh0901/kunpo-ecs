/**
 * 稀疏集合 (SparseSet) 实现
 * 一种高效的数据结构，用于ECS系统中存储和管理组件
 * 提供O(1)复杂度的添加、删除和查找操作
 */

import { IComponent } from "./interface/IComponent";
export class SparseSet<T extends IComponent> {
    /**
     * 存储实际组件数据的密集数组
     */
    private dense: T[] = [];

    /**
     * 实体ID到密集数组索引的映射
     */
    private sparse: Map<number, number> = new Map();

    /**
     * 密集数组索引到实体ID的反向映射
     */
    private entities: number[] = [];

    /**
     * 添加或更新组件
     * @param entityId 实体ID
     * @param component 组件数据
     */
    public add(entityId: number, component: T): void {
        // 如果实体已有此组件，抛出错误
        if (this.has(entityId)) {
            throw new Error(`Entity ${entityId} already has component`);
        }
        // 添加到密集数组末尾
        const index = this.dense.length;
        this.dense.push(component);
        this.entities.push(entityId);

        // 更新映射
        this.sparse.set(entityId, index);
    }

    /**
     * 删除组件
     * @param entityId 实体ID
     * @returns 是否成功删除
     */
    public remove(entityId: number): boolean {
        if (!this.has(entityId)) {
            return false;
        }

        const index = this.sparse.get(entityId)!;
        const lastIndex = this.dense.length - 1;

        // 如果不是最后一个元素，用最后一个元素替换被删除的元素
        if (index !== lastIndex) {
            // 移动最后一个元素到当前位置
            this.dense[index] = this.dense[lastIndex];
            const lastEntityId = this.entities[lastIndex];
            this.entities[index] = lastEntityId;

            // 更新最后一个元素的映射
            this.sparse.set(lastEntityId, index);
        }

        // 移除最后一个元素
        this.dense.pop();
        this.entities.pop();

        // 删除映射
        this.sparse.delete(entityId);
        return true;
    }

    /**
     * 获取组件
     * @param entityId 实体ID
     * @returns 组件或undefined(如不存在)
     */
    public get(entityId: number): T | undefined {
        if (!this.has(entityId)) {
            return undefined;
        }

        const index = this.sparse.get(entityId)!;
        return this.dense[index];
    }

    /**
     * 检查实体是否有此组件
     * @param entityId 实体ID
     */
    public has(entityId: number): boolean {
        return this.sparse.has(entityId);
    }

    /**
     * 遍历所有组件
     * @param callback 回调函数，参数为组件和实体ID
     */
    public forEach(callback: (component: T, entityId: number) => void): void {
        for (let i = 0; i < this.dense.length; i++) {
            callback(this.dense[i], this.entities[i]);
        }
    }

    /**
     * 获取组件总数
     */
    public get size(): number {
        return this.dense.length;
    }

    /**
     * 清空所有组件
     */
    public clear(): void {
        this.dense = [];
        this.entities = [];
        this.sparse.clear();
    }

    /**
     * 获取所有实体ID
     */
    public getEntityIds(): number[] {
        return [...this.entities];
    }

    /**
     * 获取所有组件
     */
    public getComponents(): T[] {
        return [...this.dense];
    }

    /**
     * 实现迭代器接口，支持for...of循环
     */
    public *[Symbol.iterator](): Iterator<[number, T]> {
        for (let i = 0; i < this.dense.length; i++) {
            yield [this.entities[i], this.dense[i]];
        }
    }

    /**
     * 仅迭代组件
     */
    public *values(): IterableIterator<T> {
        for (const component of this.dense) {
            yield component;
        }
    }

    /**
     * 仅迭代实体ID
     */
    public *keys(): IterableIterator<number> {
        for (const entityId of this.entities) {
            yield entityId;
        }
    }
} 