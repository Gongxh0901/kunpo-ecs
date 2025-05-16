/**
 * @Author: Gongxh
 * @Date: 2025-05-15
 * @Description: 系统基类
 */

import { ComponentType } from "../component/ComponentType";
import { IComponent } from "../component/IComponent";
import { Query } from "../query/Query";
import { World } from "../World";
import { ISystem } from "./ISystem";

export abstract class System implements ISystem {
    /** 
     * 世界
     * @internal
     */
    protected _world: World;
    /** 
     * 是否启用
     * @internal
     */
    protected enabled: boolean = true;

    /**
     * 系统名称
     */
    public get name(): string {
        return this.constructor.name;
    }

    /**
     * 设置世界
     * @param {World} world 世界
     */
    public set world(world: World) {
        this._world = world;
    }

    /**
     * 查询器
     */
    public query: Query;

    /**
     * 系统初始化
     * @internal
     */
    public init(): void {
        let info = this.defineQuery();
        let includes = info.includes || [];
        let excludes = info.excludes || [];
        let optionals = info.optionals || [];
        this.query = this._world.QueryBuilder.with(...includes).without(...excludes).optional(...optionals).build();
    }

    /**
     * 初始化查询器
     * @internal
     */
    protected abstract defineQuery(): { includes?: ComponentType<IComponent>[], excludes?: ComponentType<IComponent>[], optionals?: ComponentType<IComponent>[] };

    /**
     * 系统更新
     * @param {number} dt 时间间隔
     * @internal
     */
    public abstract update(dt: number): void;

    /**
     * 设置系统启用/禁用
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * 获取系统启用/禁用
     */
    public isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * 清除系统
     * @internal
     */
    public clear(): void {
        this.enabled = true;
    }
}