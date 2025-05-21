/**
 * @Author: Gongxh
 * @Date: 2025-05-15
 * @Description: 命令缓冲池
 */

import { ComponentType } from "../component/ComponentType";
import { IComponent } from "../component/IComponent";
import { Entity } from "../entity/Entity";
import { EntityPool } from "../entity/EntityPool";
import { IQueryEvent } from "../query/IQuery";
import { RecyclePool } from "../utils/RecyclePool";
import { Command, CommandType } from "./Command";


export class CommandPool {
    /** 
     * 实体池的引用
     * @internal
     */
    private readonly entityPool: EntityPool;
    /** 
     * 缓冲命令池
     * @internal
     */
    private pool: Command[] = [];

    /** 
     * 缓冲命令回收池
     * @internal
     */
    private recyclePool: RecyclePool<Command> = null;

    /** 根据组件类型可以找到所有关心该组件的查询器 */
    private readonly componentTypeQuerys: Map<number, IQueryEvent[]> = new Map();

    /** 临时存储查询器与实体的变更关联 */
    private queryEntityChanges: Map<IQueryEvent, Set<Entity>> = new Map();

    constructor(entityPool: EntityPool) {
        this.entityPool = entityPool;
        // 命令回收池
        this.recyclePool = new RecyclePool<Command>(() => new Command(), command => command.reset(), 64);
        this.recyclePool.name = "CommandPool";
    }

    /**
     * 注册查询器
     * @param query 查询器
     * @param components 查询器关心的组件类型数组
     */
    public registerQuery(query: IQueryEvent, components: number[]) {
        let len = components.length;
        for (let i = 0; i < len; i++) {
            let type = components[i];
            let queries = this.componentTypeQuerys.get(type);
            if (!queries) {
                queries = [query];
                this.componentTypeQuerys.set(type, queries);
            } else {
                queries.push(query);
            }
        }
    }

    /**
     * 添加命令
     * @param type 命令类型
     * @param entity 实体
     * @param comp 组件类型
     * @param component 组件
     */
    public addCommand(type: CommandType, entity: Entity, comp?: ComponentType<IComponent> | ComponentType<IComponent>[], component?: IComponent | IComponent[]) {
        if (type === CommandType.AddBatch) {
            this.pool.push(this.recyclePool.pop().setBatch(type, entity, comp as ComponentType<IComponent>[], component as IComponent[]));
        } else {
            this.pool.push(this.recyclePool.pop().set(type, entity, comp as ComponentType<IComponent>, component as IComponent));
        }
    }

    public update() {
        let entityPool = this.entityPool;
        let len = this.pool.length;
        if (len === 0) {
            return;
        }
        console.log("命令数量", len);
        // 看命令数量是否需要批量处理
        const needBatch = len > 200;
        const allReset = len > 2000;
        for (let i = 0; i < len; i++) {
            let command = this.pool[i];
            let entity = command.entity;
            if (command.type === CommandType.Add) {
                this.addChangedType(command.comp.ctype, entity, needBatch, allReset);
                entityPool.addComponent(entity, command.comp, command.component);
            } else if (command.type === CommandType.AddBatch) {
                let comps = command.comps;
                let components = command.components;

                this.addChangedTypes(comps, entity, needBatch, allReset);
                entityPool.addComponents(entity, comps, components);

            } else if (command.type === CommandType.RemoveOnly) {
                this.addChangedType(command.comp.ctype, entity, needBatch, allReset);
                entityPool.removeComponent(entity, command.comp);
            } else if (command.type === CommandType.RemoveAll) {
                let components = entityPool.getComponents(entity);
                if (components) {
                    let len = components.length;
                    for (let i = 0; i < len; i++) {
                        this.addChangedType(components[i], entity, needBatch, allReset);
                    }
                }
                // 移除实体对应的所有组件 并回收实体
                entityPool.removeEntity(entity)
            }
        }
        this.pool.length = 0;

        // 批量处理查询器
        if (needBatch) {
            this.queryEntityChanges.forEach((entities, query) => {
                query.changeBatchEntities(entities);
                entities.clear();
            });
            this.queryEntityChanges.clear();
        }
    }

    private addChangedType(componentType: number, entity: Entity, needBatch: boolean, allReset: boolean) {
        let queries = this.componentTypeQuerys.get(componentType);
        if (!queries) {
            return;
        }
        let len = queries.length;
        for (let i = 0; i < len; i++) {
            const query = queries[i];
            if (allReset) {
                query.needFullRefresh = true;
            } else if (needBatch) {
                let entitySet = this.queryEntityChanges.get(query);
                if (!entitySet) {
                    entitySet = new Set<Entity>();
                    this.queryEntityChanges.set(query, entitySet);
                }
                entitySet.add(entity);
            } else {
                query.changeEntity(entity);
            }
        }
    }

    private addChangedTypes(comps: ComponentType<IComponent>[], entity: Entity, needBatch: boolean, allReset: boolean) {
        for (let i = 0; i < comps.length; i++) {
            let comp = comps[i];
            let queries = this.componentTypeQuerys.get(comp.ctype);
            if (!queries) {
                return;
            }
            let len = queries.length;
            for (let i = 0; i < len; i++) {
                const query = queries[i];
                if (allReset) {
                    query.needFullRefresh = true;
                } else if (needBatch) {
                    let entitySet = this.queryEntityChanges.get(query);
                    if (!entitySet) {
                        entitySet = new Set<Entity>();
                        this.queryEntityChanges.set(query, entitySet);
                    }
                    entitySet.add(entity);
                } else {
                    query.changeEntity(entity);
                }
            }
        }
    }

    public clear() {
        this.pool = [];
        this.recyclePool.clear();
        this.queryEntityChanges.clear();
    }
}
