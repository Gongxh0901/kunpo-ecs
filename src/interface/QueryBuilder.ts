/**
 * @Author: Gongxh
 * @Date: 2025-05-15
 * @Description: 查询构建器模式
 */

import { ComponentType } from "./ComponentType";
import { IComponent } from "./IComponent";
import { Query } from "./Query";

// 示例查询构建器接口
export interface QueryBuilder {
    /**
     * 必须包含的组件
     * @param componentTypes 组件类型
     */
    with<T extends IComponent>(...componentTypes: ComponentType<T>[]): QueryBuilder;

    /**
     * 必须排除的组件
     * @param componentTypes 组件类型
     */
    without<T extends IComponent>(...componentTypes: ComponentType<T>[]): QueryBuilder;

    /**
     * 可选包含的组件
     * @param componentTypes 组件类型
     */
    optional<T extends IComponent>(...componentTypes: ComponentType<T>[]): QueryBuilder;

    // 构建并返回查询结果
    build(): Query;
}