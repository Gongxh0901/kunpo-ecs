/**
 * @Author: Gongxh
 * @Date: 2025-05-13
 * @Description: 
 */

import { Command, CommandType } from "./command/Command";
import { CommandPool } from "./command/CommandPool";
import { ComponentPool } from "./component/ComponentPool";
import { ComponentType } from "./component/ComponentType";
import { IComponent } from "./component/IComponent";
import { Entity } from "./Entity";
import { ISystem } from "./system/ISystem";
import { SystemGroup } from "./system/SystemGroup";
import { RecyclePool } from "./utils/RecyclePool";

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
     * 命令池
     * @internal
     */
    private commandPool: CommandPool = null;
    /**
     * 根系统
     * @internal
     */
    private system: SystemGroup = null;

    /**
     * 创建一个世界
     * @param name 世界名字
     */
    constructor(name: string) {
        this.name = name;
    }

    /**
     * 添加系统
     * @param system 系统
     */
    public addSystem(system: ISystem): void {
        this.system.addSystem(system);
    }

    /** 
     * 世界初始化
     */
    public initialize(): void {
        // 初始化组件池
        this.componentPool = new ComponentPool();
        // 初始化实体回收池
        this.entityPool = new RecyclePool<Entity>(128, () => this.unique++);
        // 初始化命令池
        this.commandPool = new CommandPool(this.componentPool, this.entityPool);
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
        this.commandPool.addCommand(CommandType.RemoveAll, entity);
    }

    /** 
     * 添加组件 实际是加入缓冲池，等待帧结束时执行
     * @param entity 实体
     * @param comp 组件类型
     * @returns 组件实例
     */
    public addComponent<T extends IComponent>(entity: Entity, comp: ComponentType<T>): T {
        let component = this.componentPool.createComponent(comp);
        this.commandPool.addCommand(CommandType.Add, entity, comp, component);
        return component;
    }

    /** 
     * 移除组件 实际是加入缓冲池，等待帧结束时执行
     * @param entity 实体
     * @param comp 组件类型
     */
    public removeComponent<T extends IComponent>(entity: Entity, comp: ComponentType<T>): void {
        this.commandPool.addCommand(CommandType.RemoveOnly, entity, comp);
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
        this.system.update(dt);
        // 执行缓冲池中的命令
        this.commandPool.update();
    }

    /**
     * 清理整个世界
     */
    public dispose(): void {
        this.unique = 0;
        this.cacheCommands.length = 0;
        this.componentPool.dispose();
        this.entityPool.dispose();
        this.commandPool.dispose();
    }
}