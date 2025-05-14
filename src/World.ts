/**
 * @Author: Gongxh
 * @Date: 2025-05-13
 * @Description: 
 */

import { ComponentPool } from "./ComponentPool";
import { Entity } from "./Entity";
import { ComponentType } from "./interface/ComponentType";
import { IComponent } from "./interface/IComponent";
import { RecyclePool } from "./utils/RecyclePool";

enum CommandType {
    /** 添加一个组件 */
    Add = 1,
    /** 移除一个组件 */
    RemoveOnly,
    /** 移除实体上所有组件 */
    RemoveAll
}

interface Command {
    type: CommandType;
    entity: Entity;
    comp?: ComponentType<IComponent>;
    component?: IComponent;
}

export class World {
    /** 世界名字 */
    public readonly name: string;
    /** 
     * 实体id
     * @internal
     */
    private unique: number = 0;
    /** 
     * 缓冲池
     * @internal
     */
    private cacheCommands: Command[] = [];
    /** 
     * 组件池
     * @internal
     */
    private componentPool: ComponentPool = null;
    /** 
     * 实体回收池
     * @internal
     */
    private entityPool: RecyclePool<Entity> = null;

    /**
     * 创建一个世界
     * @param name 世界名字
     */
    constructor(name: string) {
        this.name = name;
    }

    /** 
     * 世界初始化
     */
    public initialize(): void {
        // 初始化组件池
        this.componentPool = new ComponentPool();
        // 初始化实体回收池
        this.entityPool = new RecyclePool<Entity>(128, () => this.unique++);
    }

    /** 
     * 创建实体 (实体仅包含一个ID)
     */
    public createEntity(): Entity {
        return this.entityPool.pop();
    }

    /** 
     * 移除实体
     * @param entity 实体
     */
    public removeEntity(entity: Entity): void {
        this.cacheCommands.push({ type: CommandType.RemoveAll, entity: entity });
    }

    /** 
     * 添加组件 实际是加入缓冲池，等待帧结束时执行
     * @param entity 实体
     * @param comp 组件类型
     * @returns 组件实例
     */
    public addComponent<T extends IComponent>(entity: Entity, comp: ComponentType<T>): T {
        let component = this.componentPool.createComponent(comp);
        this.cacheCommands.push({ type: CommandType.Add, entity: entity, comp: comp, component: component });
        return component;
    }

    /** 
     * 移除组件 实际是加入缓冲池，等待帧结束时执行
     * @param entity 实体
     * @param comp 组件类型
     */
    public removeComponent<T extends IComponent>(entity: Entity, comp: ComponentType<T>): void {
        this.cacheCommands.push({ type: CommandType.RemoveOnly, entity: entity, comp: comp });
    }

    /** 
     * 获取组件
     */
    public getComponent<T extends IComponent>(entity: Entity, component: ComponentType<T>): T | undefined {
        return this.componentPool.getComponent(entity, component);
    }

    /**
     * 更新
     */
    public update(dt: number): void {
        // 更新系统

        // 执行缓冲池中的命令
        for (let command of this.cacheCommands) {
            let entity = command.entity;
            if (command.type === CommandType.Add) {
                this.componentPool.addComponent(entity, command.comp, command.component);
            } else if (command.type === CommandType.RemoveOnly) {
                if (this.componentPool.removeComponent(entity, command.comp) && this.componentPool.isEmptyEntity(entity)) {
                    // 删除组件后，如果实体为空，则回收实体
                    this.entityPool.insert(entity);
                }
            } else if (command.type === CommandType.RemoveAll) {
                // 移除实体对应的所有组件 并回收实体
                this.componentPool.removeAllComponents(entity) && this.entityPool.insert(entity);
            }
        }
        this.cacheCommands.length = 0;
    }

    /**
     * 清理整个世界
     */
    public dispose(): void {
        this.unique = 0;
        this.cacheCommands.length = 0;
        this.componentPool.dispose();
        this.entityPool.dispose();
    }
}