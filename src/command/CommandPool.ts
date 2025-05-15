/**
 * @Author: Gongxh
 * @Date: 2025-05-15
 * @Description: 命令缓冲池
 */

import { ComponentType } from "../component/ComponentType";
import { IComponent } from "../component/IComponent";
import { Entity } from "../entity/Entity";
import { EntityPool } from "../entity/EntityPool";
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

    constructor(entityPool: EntityPool) {
        this.entityPool = entityPool;
        // 命令回收池
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
        let entityPool = this.entityPool;

        let len = this.pool.length;
        for (let i = 0; i < len; i++) {
            let command = this.pool[i];
            let entity = command.entity;
            if (command.type === CommandType.Add) {
                entityPool.addComponent(entity, command.comp, command.component);
            } else if (command.type === CommandType.RemoveOnly) {
                entityPool.removeComponent(entity, command.comp);
            } else if (command.type === CommandType.RemoveAll) {
                // 移除实体对应的所有组件 并回收实体
                entityPool.removeEntity(entity)
            }
        }
        this.pool.length = 0;
    }

    public clear() {
        this.pool = [];
        this.recyclePool.clear();
    }
}
