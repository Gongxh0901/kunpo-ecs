/**
 * 组件池 - 使用稀疏集合高效管理不同类型的组件
 */
import { ComponentRecyclePool } from './ComponentRecyclePool';
import { IComponent } from './interface/IComponent';
import { Mask } from './Mask';
import { SparseSet } from './SparseSet';

export class ComponentPool {
    /**
     * 组件类型对应的稀疏集合
     */
    private pools: Map<number, SparseSet<IComponent>> = new Map();

    /**
     * 实体掩码
     */
    private entityMasks: Map<number, Mask> = new Map();

    /**
     * 组件池初始化
     */
    constructor() {
        this.pools.clear();
        this.entityMasks.clear();
        // 用注册的所有组件数据 创建稀疏集合

        for (let i = 0; i < 0; i++) {
            // 创建组件稀疏集合
            let sparseSet = new SparseSet<IComponent>();
            // 创建组件回收池
            sparseSet.recyclePool = new ComponentRecyclePool<IComponent>(null, 0, 256);
            this.pools.set(i, sparseSet);
        }
    }

    /**
     * 获取或创建特定ID的组件池
     * @param componentId 组件ID
     * @returns 对应的稀疏集合
     */
    private getPool<T extends IComponent>(componentId: number): SparseSet<T> {
        return this.pools.get(componentId) as SparseSet<T>;
    }

    /**
     * 添加组件到实体
     * @param entityId 实体ID
     * @param componentId 组件ID
     * @param component 组件数据
     */
    public addComponent<T extends IComponent>(entityId: number, componentId: number, component: T): void {
        // 获取对应组件池并添加组件
        const pool = this.getPool<T>(componentId);
        pool.add(entityId, component);

        // 使用Mask标记组件
        if (!this.entityMasks.has(entityId)) {
            this.entityMasks.set(entityId, new Mask());
        }
        this.entityMasks.get(entityId)!.set(componentId);
    }

    /**
     * 删除实体的特定组件
     * @param entityId 实体ID
     * @param componentId 组件ID
     * @returns 是否成功删除
     */
    public removeComponent(entityId: number, componentId: number): boolean {
        const pool = this.pools.get(componentId);
        if (!pool || !pool.has(entityId)) {
            return false;
        }

        // 从组件池中移除
        const result = pool.remove(entityId);

        // 更新Mask
        if (result && this.entityMasks.has(entityId)) {
            this.entityMasks.get(entityId)!.delete(componentId);
        }

        return result;
    }

    /**
     * 获取实体的组件
     * @param entityId 实体ID
     * @param componentId 组件ID
     * @returns 组件或undefined(如不存在)
     */
    public getComponent<T extends IComponent>(entityId: number, componentId: number): T | undefined {
        const pool = this.pools.get(componentId) as SparseSet<T> | undefined;
        if (!pool) {
            return undefined;
        }
        return pool.get(entityId);
    }

    /**
     * 检查实体是否拥有特定组件
     * @param entityId 实体ID
     * @param componentId 组件ID
     */
    public hasComponent(entityId: number, componentId: number): boolean {
        // 快速通过Mask检查
        if (this.entityMasks.has(entityId)) {
            return this.entityMasks.get(entityId)!.has(componentId);
        }
        return false;
    }

    /**
     * 删除实体的所有组件
     * @param entityId 实体ID
     */
    public removeAllComponents(entityId: number): void {
        const entityMask = this.entityMasks.get(entityId);
        if (!entityMask) {
            return;
        }

        // 遍历所有组件池，移除该实体的组件
        for (const [componentId, pool] of this.pools.entries()) {
            if (entityMask.has(componentId)) {
                pool.remove(entityId);
            }
        }

        // 清除记录
        this.entityMasks.delete(entityId);
    }

    // /**
    //  * 获取拥有特定组件的所有实体
    //  * @param componentId 组件ID
    //  * @returns 实体ID数组
    //  */
    // public getEntitiesWithComponent(componentId: number): number[] {
    //     const pool = this.pools.get(componentId);
    //     return pool ? pool.getEntityIds() : [];
    // }

    // /**
    //  * 查询同时拥有某些组件且不拥有其他组件的实体
    //  * @param withComponentIds 必须拥有的组件ID
    //  * @param withoutComponentIds 必须不拥有的组件ID
    //  * @returns 匹配的实体ID数组
    //  */
    // public query(withComponentIds: number[] = [], withoutComponentIds: number[] = []): number[] {
    //     if (withComponentIds.length === 0) {
    //         return []; // 如果没有指定必需组件，返回空数组
    //     }

    //     // 创建用于匹配的掩码
    //     const requiredMask = new Mask();
    //     const excludedMask = new Mask();

    //     for (const id of withComponentIds) {
    //         requiredMask.set(id);
    //     }

    //     for (const id of withoutComponentIds) {
    //         excludedMask.set(id);
    //     }

    //     // 找出包含实体最少的组件池，作为查询起点
    //     let smallestPool: SparseSet<any> | undefined;
    //     let smallestComponentId = -1;

    //     for (const id of withComponentIds) {
    //         const pool = this.pools.get(id);
    //         if (!pool) return []; // 如果有必需组件不存在，结果必然为空

    //         if (!smallestPool || pool.size < smallestPool.size) {
    //             smallestPool = pool;
    //             smallestComponentId = id;
    //         }
    //     }

    //     // 从最小集合开始筛选符合条件的实体
    //     const result: number[] = [];
    //     smallestPool!.forEach((_, entityId) => {
    //         const entityMask = this.entityMasks.get(entityId);
    //         if (entityMask &&
    //             entityMask.include(requiredMask) &&
    //             !entityMask.any(excludedMask)) {
    //             result.push(entityId);
    //         }
    //     });

    //     return result;
    // }

    // /**
    //  * 对所有拥有特定组件的实体执行操作
    //  * @param componentId 组件ID
    //  * @param callback 回调函数
    //  */
    // public forEachComponent<T extends IComponent>(componentId: number, callback: (component: T, entityId: number) => void): void {
    //     const pool = this.pools.get(componentId) as SparseSet<T> | undefined;
    //     if (pool) {
    //         pool.forEach(callback);
    //     }
    // }

    // /**
    //  * 执行一个系统更新，处理符合条件的实体
    //  * @param withComponentIds 必需组件ID
    //  * @param withoutComponentIds 排除组件ID
    //  * @param updateFn 更新函数
    //  */
    // public applySystem<T extends Record<number, any>>( withComponentIds: number[], withoutComponentIds: number[], updateFn: (entityId: number, components: T) => void
    // ): void {
    //     // 查询符合条件的实体
    //     const entities = this.query(withComponentIds, withoutComponentIds);

    //     // 对每个实体执行更新
    //     for (const entityId of entities) {
    //         // 收集该实体所有需要的组件
    //         const components = {} as T;
    //         for (const id of withComponentIds) {
    //             components[id] = this.getComponent(entityId, id);
    //         }

    //         // 执行更新
    //         updateFn(entityId, components);
    //     }
    // }
}