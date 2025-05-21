/**
 * @Author: Gongxh
 * @Date: 2025-05-18
 * @Description: 查询器接口
 */

import { Component } from "../component/Component";
import { ComponentPool } from "../component/ComponentPool";
import { ComponentType } from "../component/ComponentType";
import { IComponent } from "../component/IComponent";
import { Entity } from "../entity/Entity";
import { EntityPool } from "../entity/EntityPool";
import { IMask } from "../utils/IMask";

export interface IQueryResult {
    /** @internal 缓存上次查询的结果, 避免每帧重新计算 */
    cachedEntities: Entity[];

    /** @internal 按实体顺序缓存组件 (组件类型 组件数组) */
    cachedComponents: IComponent[][];

    /** 所有匹配的实体 */
    entities(): Entity[];

    /** 通过类型获取匹配的组件 */
    components<T extends Component>(comp: ComponentType<T>): T[];
}

export interface IQueryEvent {
    /** 变化的实体集合 */
    changeEntities: Set<Entity>;
    /** 匹配的实体 value是匹配实体数组的索引 */
    matchEntities: Map<Entity, number>;
    /** 是否需要全量刷新 */
    needFullRefresh: boolean;
    /** 变化的实体 */
    changeEntity(entity: Entity): void;
    /** 变化的实体集合 */
    batchChangeEntities(entities: Entity[]): void;
    /** 根据变化刷新缓存 */
    refreshCache(): void;
    /** 全量刷新 */
    resetCache(): void;
    /** 清理 */
    clear(): void;
}

export interface IQuery {
    /** 实体池的引用 */
    entityPool: EntityPool;

    /** 组件池的引用 */
    componentPool: ComponentPool;

    /** 必须包含的组件掩码 */
    _includeMask: IMask;

    /** 必须排除的组件掩码 */
    _excludeMask: IMask;

    /** 必须得组件 */
    includes: number[];

    /** 必须排除的组件 */
    excludes: number[];

    /** 可选组件 */
    optionals: number[];
}
