/**
 * @Author: Gongxh
 * @Date: 2025-05-15
 * @Description: 查询结果迭代器
 */

import { Entity } from "../Entity";
import { ComponentType } from "../component/ComponentType";
import { IComponent } from "../component/IComponent";

export interface Query {
    // 迭代满足条件的实体
    entities(): Iterable<Entity>;

    // 获取特定实体的特定组件
    getComponent<T extends IComponent>(entity: Entity, componentType: ComponentType<T>): T | null;

    // 同时获取多个组件（避免多次查找）
    getComponents(entity: Entity, ...componentTypes: ComponentType<any>[]): IComponent[];

    // 组件直接访问（适用于组件查询模式）
    iterate<T extends IComponent>(componentType: ComponentType<T>, callback: (component: T, entity: Entity) => void): void;

    // 批量处理（适用于实体查询模式）
    each(callback: (entity: Entity) => void): void;
}