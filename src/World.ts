/**
 * @Author: Gongxh
 * @Date: 2025-05-13
 * @Description: 
 */

import { ComponentPool } from "./ComponentPool";
import { Entity } from "./Entity";
import { ComponentType } from "./interface/ComponentType";
import { IComponent } from "./interface/IComponent";
import { Mask } from "./Mask";

export class World {
    /** 组件池 */
    private componentPool: ComponentPool = null;


    /** 
     * 世界初始化
     */
    public initialize(): void {
        this.componentPool = new ComponentPool();
    }

    /** 
     * 创建实体 (实体仅包含一个ID)
     */
    public createEntity(): Entity {
        return 0;
    }

    /** 
     * 销毁实体
     */
    public destroyEntity(entity: Entity): void {
        // 销毁实体对应的所有组件
        this.componentPool.removeAllComponents(entity);
    }

    /** 
     * 添加组件
     */
    public addComponent<T extends IComponent>(entity: Entity, component: ComponentType<T>): void {
        this.componentPool.addComponent(entity, component);
    }

    /** 
     * 移除组件
     */
    public removeComponent<T extends IComponent>(entity: Entity, component: ComponentType<T>): void {
        this.componentPool.removeComponent(entity, component);
    }

    /** 
     * 获取组件
     */
    public getComponent<T extends IComponent>(entity: Entity, component: ComponentType<T>): T | undefined {
        return this.componentPool.getComponent(entity, component);
    }

    /**
     * 获取实体的组件掩码
     */
    public getEntityMask(entity: Entity): Mask {
        return this.componentPool.getEntityMask(entity);
    }

    /**
     * 更新
     */
    public update(dt: number): void {

    }

    /**
     * 清理
     */
    public dispose(): void {

    }
}