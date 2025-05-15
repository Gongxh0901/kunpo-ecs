/**
 * @Author: Gongxh
 * @Date: 2025-05-15
 * @Description: 命令缓冲池
 */

import { Command, CommandType } from "./command/Command";
import { ComponentPool } from "./component/ComponentPool";
import { Entity } from "./Entity";
import { ComponentType, IComponent } from "./kunpoecs";
import { RecyclePool } from "./utils/RecyclePool";

export class CommandPool {
    /** 
     * 世界
     * @internal
     */
    private readonly componentPool: ComponentPool;
    /** 
     * 实体池
     * @internal
     */
    private readonly entityPool: RecyclePool<Entity>;
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

    constructor(componentPool: ComponentPool, entityPool: RecyclePool<Entity>) {
        this.componentPool = componentPool;
        this.entityPool = entityPool;
        this.recyclePool = new RecyclePool<Command>(64, () => new Command(), (command) => command.reset());
    }

    /**
     * 添加命令
     * @param type 命令类型
     * @param entity 实体
     * @param comp 组件类型
     * @param component 组件
     */
    public addCommand(type: CommandType, entity: Entity, comp?: ComponentType<IComponent>, component?: IComponent) {
        this.pool.push(this.recyclePool.pop().set(type, entity, comp, component));
    }

    public update() {

        let componentPool = this.componentPool;
        let entityPool = this.entityPool;

        let len = this.pool.length;
        for (let i = 0; i < len; i++) {
            let command = this.pool[i];
            let entity = command.entity;
            if (command.type === CommandType.Add) {
                componentPool.addComponent(entity, command.comp, command.component);
            } else if (command.type === CommandType.RemoveOnly) {
                if (componentPool.removeComponent(entity, command.comp) && componentPool.isEmptyEntity(entity)) {
                    // 删除组件后，如果实体为空，则回收实体
                    entityPool.insert(entity);
                }
            } else if (command.type === CommandType.RemoveAll) {
                // 移除实体对应的所有组件 并回收实体
                componentPool.removeAllComponents(entity) && entityPool.insert(entity);
            }
        }
        this.pool.length = 0;
    }

    public dispose() {
        this.pool = [];
        this.recyclePool.dispose();
    }
}
