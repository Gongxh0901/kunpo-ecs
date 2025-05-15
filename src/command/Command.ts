/**
 * @Author: Gongxh
 * @Date: 2025-05-15
 * @Description: 
 */

import { Entity } from "../entity/Entity";
import { ComponentType, IComponent } from "../kunpoecs";

export enum CommandType {
    /** 添加一个组件 */
    Add = 1,
    /** 移除一个组件 */
    RemoveOnly,
    /** 移除实体上所有组件 */
    RemoveAll
}


interface ICommand {
    type: CommandType;
    entity: Entity;
    comp?: ComponentType<IComponent>;
    component?: IComponent;
}

export class Command implements ICommand {
    /** 命令类型 */
    type: CommandType;
    /** 实体 */
    entity: Entity;
    /** 组件类型 */
    comp?: ComponentType<IComponent>;
    /** 组件 */
    component?: IComponent;

    /**
     * 设置命令
     * @param type 命令类型
     * @param entity 实体
     * @param comp 组件类型
     * @param component 组件
     */
    public set(type: CommandType, entity: Entity, comp?: ComponentType<IComponent>, component?: IComponent): Command {
        this.type = type;
        this.entity = entity;
        this.comp = comp;
        this.component = component;
        return this;
    }

    /**
     * 重置命令
     */
    public reset(): void {
        this.comp = null;
        this.component = null;
    }
}