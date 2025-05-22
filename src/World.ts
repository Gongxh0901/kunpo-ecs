/**
 * @Author: Gongxh
 * @Date: 2025-05-13
 * @Description: 
 */

import { CommandPool } from "./command/CommandPool";
import { Component } from "./component/Component";
import { ComponentPool } from "./component/ComponentPool";
import { ComponentType } from "./component/ComponentType";
import { IComponent } from "./component/IComponent";
import { Data } from "./Data";
import { _ecsdecorator } from "./ECSDecorator";
import { Entity } from "./entity/Entity";
import { EntityPool } from "./entity/EntityPool";
import { QueryBuilder } from "./query/QueryBuilder";
import { QueryPool } from "./query/QueryPool";
import { ISystem } from "./system/ISystem";
import { SystemGroup } from "./system/SystemGroup";

export class World {
    /** 世界名字 */
    public readonly name: string;

    /** 最大实体数量 */
    public readonly max: number = 0;

    /** 
     * 组件池
     */
    public componentPool: ComponentPool = null;
    /** 
     * 实体池
     */
    public entityPool: EntityPool = null;
    /**
     * 命令池
     * @internal
     */
    private commandPool: CommandPool = null;
    /**
     * 查询器池
     * @internal
     */
    private queryPool: QueryPool = null;
    /**
     * 根系统
     * @internal
     */
    private rootSystem: SystemGroup = null;

    /**
     * 创建一个世界
     * @param name 世界名字
     * @param max 最大实体数量
     */
    constructor(name: string, max: number = 1 << 18) {
        this.name = name;
        this.max = max;
        // 初始化根系统
        this.rootSystem = new SystemGroup("RootSystem");
        this.rootSystem.world = this;
    }

    /**
     * 添加系统
     * @param system 系统
     */
    public addSystem(system: ISystem): void {
        this.rootSystem.addSystem(system);
    }

    /** 
     * 世界初始化
     */
    public initialize(): void {
        if (this.componentPool) {
            throw new Error("World已经初始化过，请不要重复初始化");
        }
        // 初始化组件池
        this.componentPool = new ComponentPool();
        // 初始化实体池
        this.entityPool = new EntityPool(this.componentPool, this.max);
        // 初始化命令池
        this.commandPool = new CommandPool(this.entityPool, this.componentPool);
        // 初始化查询器池
        this.queryPool = new QueryPool(this.componentPool, this.entityPool, this.commandPool);

        // 系统初始化
        this.rootSystem.init();
    }

    /** 
     * 通过配置数据创建实体
     * @param entityName 实体名 (kunpo-ec插件中导出的实体名)
     * @returns 实体和组件
     */
    public createEntity(entityName: string): { entity: Entity, components: Record<string, Component> } {
        const entity = this.entityPool.createEntity();
        const entityConfig = Data.getEntityConfig(entityName);
        return { entity: entity, components: this.addComponents(entity, entityConfig) };
    }

    /** 
     * 创建一个空实体 (实体仅包含一个ID)
     */
    public createEmptyEntity(): Entity {
        return this.entityPool.createEntity();
    }

    /** 
     * 移除实体
     * @param entity 实体
     */
    public removeEntity(entity: Entity): void {
        this.commandPool.delEntity(entity);
    }

    /** 
     * 添加组件 实际是加入缓冲池，等待帧结束时执行
     * @param entity 实体
     * @param comp 组件类型
     * @returns 组件实例
     */
    public addComponent<T extends IComponent>(entity: Entity, comp: ComponentType<T>): T {
        let component = this.componentPool.createComponent(comp.ctype);
        this.commandPool.addComponent(entity, comp.ctype, component);
        return component as T;
    }

    private addComponents(entity: Entity, infos: { name: string, props: Record<string, any> }[]): Record<string, Component> {
        let result = {} as Record<string, Component>;
        for (const { name, props } of infos) {
            const comp = _ecsdecorator.getComponentCtor(name);
            let component = this.componentPool.createComponent(comp.ctype);
            for (const key in props) {
                (component as any)[key] = props[key];
            }
            result[name] = component;
            this.commandPool.addComponent(entity, comp.ctype, component);
        }
        return result;
    }

    /** 
     * 移除组件 实际是加入缓冲池，等待帧结束时执行
     * @param entity 实体
     * @param comp 组件类型
     */
    public removeComponent<T extends IComponent>(entity: Entity, ...comps: ComponentType<T>[]): void {
        for (const comp of comps) {
            this.commandPool.delComponent(entity, comp.ctype);
        }
    }

    /** 
     * 获取组件
     * @param entity 实体
     * @param comp 组件类型
     * @returns 组件
     */
    public getComponent<T extends IComponent>(entity: Entity, comp: ComponentType<T>): T | undefined {
        return this.entityPool.getComponent(entity, comp.ctype) as T;
    }

    /**
     * 更新世界
     * @param dt 时间间隔
     */
    public update(dt: number): void {
        // 执行缓冲池中的命令
        this.commandPool.update();
        // 更新系统
        this.rootSystem.update(dt);
    }

    /**
     * 创建查询构建器
     * @returns 查询构建器
     */
    public get QueryBuilder(): QueryBuilder {
        return new QueryBuilder(this.queryPool);
    }

    /**
     * 清理整个世界
     */
    public clear(): void {
        this.componentPool.clear();
        this.entityPool.clear();
        this.commandPool.clear();
        this.queryPool.clear();
        this.rootSystem.clear();
    }
}