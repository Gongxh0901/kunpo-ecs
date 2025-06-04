/**
 * @Author: Gongxh
 * @Date: 2025-05-26
 * @Description: 用来创建四叉树中使用的形状 使用后删除组件
 */

import { Enum } from "cc";
import { ecs } from "../../../header";
import { EntityType } from "../header/EntityType";
const { ecsclass, ecsprop } = ecs._ecsdecorator;

@ecsclass("ShapeCircle", { describe: "圆形组件" })
export class ShapeCircle extends ecs.Component {
    @ecsprop({ type: "float", defaultValue: 0 })
    public radius: number = 0;

    @ecsprop({ type: "enum", format: Enum(EntityType), defaultValue: EntityType.None, displayName: "形状类型" })
    public tag: EntityType = EntityType.None;

    @ecsprop({ type: "float", defaultValue: 0, displayName: "x偏移" })
    public offsetX: number = 0;

    @ecsprop({ type: "float", defaultValue: 0, displayName: "y偏移" })
    public offsetY: number = 0;

    public reset(): void {
        this.offsetX = 0;
        this.offsetY = 0;
        this.radius = 0;
        this.tag = EntityType.None;
    }
}

@ecsclass("ShapeBox", { describe: "矩形组件" })
export class ShapeBox extends ecs.Component {
    @ecsprop({ type: "float", defaultValue: 0 })
    public width: number = 0;

    @ecsprop({ type: "float", defaultValue: 0 })
    public height: number = 0;

    @ecsprop({ type: "float", defaultValue: 0 })
    public x: number = 0;

    @ecsprop({ type: "float", defaultValue: 0 })
    public y: number = 0;

    @ecsprop({ type: "enum", format: Enum(EntityType), defaultValue: EntityType.None, displayName: "形状类型" })
    public tag: EntityType = EntityType.None;

    @ecsprop({ type: "float", defaultValue: 0, displayName: "x偏移" })
    public offsetX: number = 0;

    @ecsprop({ type: "float", defaultValue: 0, displayName: "y偏移" })
    public offsetY: number = 0;

    public reset(): void {
        this.width = 0;
        this.height = 0;
        this.x = 0;
        this.y = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.tag = EntityType.None;
    }
}