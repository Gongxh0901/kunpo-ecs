/**
 * @Author: Gongxh
 * @Date: 2025-05-19
 * @Description: 配置数据
 */

import { ComponentType } from "./component/ComponentType";
import { IComponent } from "./component/IComponent";
import { _ecsdecorator } from "./ECSDecorator";

export class Data {
    /** 注册的组件 通过名字获取组件 */
    private static readonly componentMap: Map<string, ComponentType<IComponent>> = new Map();

    /** 实体的配置数据 map的key: 实体名, value中的name:组件名 props:组件属性 */
    private static readonly entityMap: Map<string, { name: string, props: Record<string, any> }[]> = new Map();

    public static parse(config: Record<string, any>): void {
        for (const entityName in config) {
            let componentInfos = config[entityName];
            let components: { name: string, props: Record<string, any> }[] = [];
            for (const componentName in componentInfos) {
                components.push({ name: componentName, props: componentInfos[componentName] })
            }
            this.entityMap.set(entityName, components);
        }
    }

    public static init(): void {
        const eclassMap = _ecsdecorator.getComponentMaps();
        for (const [ctor, data] of eclassMap.entries()) {
            this.componentMap.set(data.name, ctor);
        }
    }

    /** 通过组件名获取组件类型 */
    public static getComponentType(name: string): ComponentType<IComponent> {
        return this.componentMap.get(name);
    }

    /** 通过实体名获取实体配置 */
    public static getEntityConfig(name: string): { name: string, props: Record<string, any> }[] {
        return this.entityMap.get(name);
    }
}