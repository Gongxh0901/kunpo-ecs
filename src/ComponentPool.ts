/**
 * 组件池 - 使用稀疏集合高效管理不同类型的组件
 */
import { _ecsdecorator } from './ECSDecorator';
import { Entity } from './Entity';
import { ComponentType } from './interface/ComponentType';
import { IComponent } from './interface/IComponent';
import { BIGINT_SUPPORTED, IMask } from './interface/IMask';
import { SparseSet } from './SparseSet';
import { ArrayMask } from './utils/ArrayMask';
import { BigIntMask } from './utils/BigIntMask';
import { RecyclePool } from './utils/RecyclePool';

export class ComponentPool {
    /**
     * 组件类型对应的稀疏集合 组件类型 -> 稀疏集合
     * @internal
     */
    private readonly pools: Map<number, SparseSet<IComponent>> = new Map();

    /**
     * 组件回收池 组件类型 -> 回收池
     * @internal
     */
    private readonly recyclePools: Map<number, RecyclePool<IComponent>> = new Map();

    /** 
     * 掩码回收池
     * @internal
     */
    private readonly maskRecyclePool: RecyclePool<IMask> = null;
    /**
     * 实体掩码 实体 -> 组件集合的掩码
     * @internal
     */
    private readonly entityMasks: Map<Entity, IMask> = new Map();

    /**
     * 实体上组件计数器 实体 -> 组件数量
     * @internal
     */
    private readonly entityComponentCount: Map<Entity, number> = new Map();

    /**
     * 组件池初始化
     * @internal
     */
    constructor() {
        this.pools.clear();
        this.entityMasks.clear();
        // 用注册的所有组件数据 创建稀疏集合

        let componentMaps = _ecsdecorator.getComponentMaps();
        for (let [ctor, info] of componentMaps.entries()) {
            let type = ctor.ctype;
            // 创建稀疏集合
            this.pools.set(type, new SparseSet<IComponent>());
            // 创建组件回收池
            this.recyclePools.set(type, new RecyclePool<IComponent>(16, () => new ctor(), (component: IComponent) => {
                component.reset();
            }));
        }
        // 实体掩码回收池
        this.maskRecyclePool = new RecyclePool<IMask>(128, () => BIGINT_SUPPORTED ? new BigIntMask() : new ArrayMask(), (mask: IMask) => {
            mask.clear();
        });
    }

    /**
     * 获取或创建特定ID的组件池
     * @param componentType 组件类型
     * @returns 对应的稀疏集合
     * @internal
     */
    private getPool<T extends IComponent>(componentType: number): SparseSet<T> {
        return this.pools.get(componentType) as SparseSet<T>;
    }

    /**
     * 创建组件
     * @param component 组件类型
     * @returns 组件实例
     * @internal
     */
    public createComponent<T extends IComponent>(component: ComponentType<T>): T {
        let type = component.ctype;
        return this.recyclePools.get(type).pop() as T;
    }

    /**
     * 添加组件到实体 (其实是预添加)
     * @param entity 实体
     * @param comp 组件类型
     * @param component 组件实例
     * @internal
     */
    public addComponent<T extends IComponent>(entity: Entity, comp: ComponentType<T>, component: T): void {
        let type = comp.ctype;

        // 获取对应组件池并添加组件
        const pool = this.getPool<T>(type);
        pool.add(entity, component);

        // 使用Mask标记组件
        if (!this.entityMasks.has(entity)) {
            this.entityMasks.set(entity, this.maskRecyclePool.pop().set(type));
            this.entityComponentCount.set(entity, 1);
        } else {
            this.entityMasks.get(entity).set(type);
            this.entityComponentCount.set(entity, this.entityComponentCount.get(entity) + 1);
        }
    }

    /**
     * 获取实体的组件
     * @param entity 实体
     * @param component 组件类型
     * @returns 组件或undefined(如不存在)
     * @internal
     */
    public getComponent<T extends IComponent>(entity: Entity, component: ComponentType<T>): T | undefined {
        let type = component.ctype;
        if (!this.hasComponent(entity, component)) {
            // 实体上没有组件
            console.warn(`entity ${entity} has no component ${component.cname}`);
            return undefined;
        }
        // 获取组件
        return (this.pools.get(type) as SparseSet<T>).get(entity) as T;
    }

    /**
     * 检查实体是否拥有特定组件
     * @param entity 实体
     * @param component 组件类型
     * @internal
     */
    public hasComponent(entity: Entity, component: ComponentType<any>): boolean {
        // 检查实体上是否包含组件
        if (this.entityMasks.has(entity)) {
            return this.entityMasks.get(entity).has(component.ctype);
        }
        return false;
    }

    /**
     * 删除实体的特定组件
     * @param entity 实体
     * @param comp 组件类型
     * @returns 是否成功删除
     * @internal
     */
    public removeComponent<T extends IComponent>(entity: Entity, comp: ComponentType<T>): boolean {
        let type = comp.ctype;
        if (!this.hasComponent(entity, comp)) {
            // 实体上没有组件
            console.warn(`entity ${entity} has no component ${comp.cname}`);
            return false;
        }
        const pool = this.pools.get(type);
        // 从组件池中移除 并 回收组件
        this.recyclePools.get(type).insert(pool.remove(entity));

        let count = this.entityComponentCount.get(entity) - 1;
        if (count === 0) {
            // 回收掩码
            this.maskRecyclePool.insert(this.entityMasks.get(entity).clear());
            // 删除实体掩码
            this.entityMasks.delete(entity);
            // 删除实体组件计数器
            this.entityComponentCount.delete(entity);
        } else {
            // 更新Mask
            this.entityMasks.get(entity).delete(type);
            this.entityComponentCount.set(entity, count);
        }
        return true;
    }

    /**
     * 删除实体的所有组件
     * @param entity 实体
     * @internal
     */
    public removeAllComponents(entity: Entity): boolean {
        if (!this.entityMasks.has(entity)) {
            return false;
        }
        const entityMask = this.entityMasks.get(entity);
        // 遍历所有组件池，移除该实体的组件
        for (const [type, pool] of this.pools.entries()) {
            if (entityMask.has(type)) {
                this.recyclePools.get(type).insert(pool.remove(entity));
            }
        }
        // 回收掩码
        this.maskRecyclePool.insert(this.entityMasks.get(entity).clear());
        // 删除实体掩码
        this.entityMasks.delete(entity);
        // 删除实体组件计数器
        this.entityComponentCount.delete(entity);
        return true;
    }

    /**
     * O(1) 检查是否组件为空
     * @param entity 实体
     * @returns 是否为空
     * @internal
     */
    public isEmptyEntity(entity: Entity): boolean {
        return !this.entityComponentCount.has(entity) || this.entityComponentCount.get(entity) === 0;
    }

    /**
     * 获取实体的组件掩码
     * @internal
     */
    public getEntityMask(entity: Entity): IMask {
        return this.entityMasks.get(entity);
    }

    /**
     * 清理组件池中所有内容
     * @internal
     */
    public dispose(): void {
        this.pools.clear();
        this.recyclePools.clear();
        this.maskRecyclePool.dispose();
        this.entityMasks.clear();
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